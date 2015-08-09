'use strict';

// Returns a regular expression which will match against 1 or more occurrences of a class name
function classMatchingRegex(className) {
    return new RegExp("\\b" + className + "\\b");
}

// Returns true iff the specified element has the specified class name
function hasClass(element, className) {
    return classMatchingRegex(className).test(element.className);
}

// Adds the specified class to the specified element, if the element does not already have the class
function addClass(element, className) {
    if (hasClass(element, className)) return; // Element already has the class - so do not add it
    element.className = element.className === "" ? className : element.className + " " + className;
}

// Removes the specified class from the specified element
function removeClass(element, className) {
    if (!hasClass(element, className)) return; // Element already does not have this class - so nothing to remove
    element.className = element.className.replace(classMatchingRegex(className), "").trim();
}

function removeElement(element) {
    element.parentNode.removeChild(element);
}

function removeElementById(id) {
    removeElement(document.getElementById(id));
}

function prependChild(child, to) {
    to.insertBefore(child, to.firstChild);
}

function insertBeforeLastChild(child, to) {
    to.insertBefore(child, to.children[to.children.length - 1]);
}

// Thanks to http://stackoverflow.com/questions/814564/inserting-html-elements-with-javascript
function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

// Thanks to: http://arstechnica.com/civis/viewtopic.php?f=20&t=338519
function getNextValidSibling(e) {
    var nextNode = e.nextSibling;
    while (nextNode && nextNode.nodeType != 1) {
        nextNode = nextNode.nextSibling;
    }
    return nextNode;
}
function getPrevValidSibling(e) {
    var prevNode = e.previousSibling;
    while (prevNode && prevNode.nodeType != 1) {
        prevNode = prevNode.previousSibling;
    }
    return prevNode;
}

// From https://developer.mozilla.org/en-US/docs/Web/API/document/cookie#A_little_framework.3A_a_complete_cookies_reader.2Fwriter_with_full_unicode_support
var docCookies = {
    getItem: function (sKey) {
        if (!sKey) {
            return null;
        }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },

    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
            return false;
        }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },

    removeItem: function (sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) {
            return false;
        }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    },

    hasItem: function (sKey) {
        if (!sKey) {
            return false;
        }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },

    keys: function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
    }
};

function getLoggedInUserIdFromCookie() {
    return docCookies.getItem('user_id');
}

function getLoggedInFullNameFromCookie() {
    return docCookies.getItem("full_name");
}

function setLoggedInFullNameFromCookie(full_name) {
    docCookies.setItem("full_name", full_name);
}

// From: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/8809472#8809472
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
function generateMessageId() {
    return generateUUID();
}
function generateSupId() {
    return generateUUID();
}

var allAjax = [];
function abortAllAjax() {
    _.each(
        allAjax,
        function (ajax) {
            ajax.abort();
        }
    );

    allAjax = [];
}
// Example derived from: https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
// TODO: Cancel/don't execute callbacks if server changes
function ajax(url, objectToSend, onSuccess, onError) {
    var httpRequest = new XMLHttpRequest();

    // Set the function to call when the state changes
    httpRequest.addEventListener("readystatechange", function () {

        // These readyState 4 means the call is complete, and status
        // 200 means we got an OK response from the server
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            // Parse the response text as a JSON object
            var response = JSON.parse(httpRequest.responseText);
            var protocol_version = response.protocol_version;
            var error = response.error;
            var command = response.command;
            var message_id = response.message_id;
            var reply_data = response.reply_data;

            if (error.length > 0) {
                // There was an error
                onError(protocol_version, error, command, message_id, reply_data);
                return;
            }

            onSuccess(protocol_version, error, command, message_id, reply_data);
        }
    });

    // This opens a POST connection with the server at the given URL
    httpRequest.open('POST', url);

    // Set the data type being sent as JSON
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    // Send the JSON object, serialized as a string
    httpRequest.send(JSON.stringify(objectToSend));

    allAjax.push(httpRequest);
}

/**
 * From: http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


var canvasDraw = {
    defaultFillColour: 'black',
    defaultBorderColour: 'black',
    defaultThickness: 4,

    line: function (canvasContext, fromX, fromY, toX, toY, colour, thickness, lineCap) {
        colour = typeof colour !== 'undefined' ? colour : this.defaultBorderColour;
        thickness = typeof thickness !== 'undefined' ? thickness : defaultThickness;
        lineCap = typeof lineCap !== 'undefined' ? lineCap : "square";

        canvasContext.save();
        canvasContext.strokeStyle = colour;
        canvasContext.lineWidth = thickness;
        canvasContext.lineCap = lineCap;
        canvasContext.beginPath();
        canvasContext.moveTo(fromX, fromY);
        canvasContext.lineTo(toX, toY);
        canvasContext.closePath();
        canvasContext.stroke();
        canvasContext.restore();
    },

    rectangle: function (canvasContext, centerX, centerY, width, height, fillColour, borderColour, borderThickness) {
        fillColour = typeof fillColour !== 'undefined' ? fillColour : this.defaultFillColour;
        borderColour = typeof borderColour !== 'undefined' ? borderColour : this.defaultBorderColour;
        borderThickness = typeof borderThickness !== 'undefined' ? borderThickness : this.defaultThickness;

        canvasContext.save();
        canvasContext.fillStyle = fillColour;
        canvasContext.strokeStyle = borderColour;
        canvasContext.lineWidth = borderThickness;
        canvasContext.beginPath();
        canvasContext.rect(centerX - width / 2, centerY - height / 2, width, height);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
        canvasContext.restore();
    },

    circle: function (canvasContext, centerX, centerY, radius, fillColour, borderColour, borderThickness, startAngle) {
        fillColour = typeof fillColour !== 'undefined' ? fillColour : this.defaultFillColour;
        borderColour = typeof borderColour !== 'undefined' ? borderColour : this.defaultBorderColour;
        borderThickness = typeof borderThickness !== 'undefined' ? borderThickness : this.defaultThickness;
        startAngle = typeof startAngle !== 'undefined' ? startAngle : 2 * Math.PI;

        canvasContext.save();
        canvasContext.fillStyle = fillColour;
        canvasContext.strokeStyle = borderColour;
        canvasContext.lineWidth = borderThickness;
        canvasContext.beginPath();
        canvasContext.arc(centerX, centerY, radius, startAngle, 0, false);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
        canvasContext.restore();
    },

    semicircle: function (canvasContext, centerX, centerY, radius, fillColour, borderColour, borderThickness) {
        this.circle(canvasContext, centerX, centerY, radius, fillColour, borderColour, borderThickness, Math.PI);
    },

    text: function (canvasContext, text, fontSize, colour, x, y, font) {
        text = typeof text !== 'undefined' ? text : "Debug";
        fontSize = typeof fontSize !== 'undefined' ? fontSize + "px" : "36px";
        colour = typeof colour !== 'undefined' ? colour : "black";
        x = typeof x !== 'undefined' ? x : 0;
        y = typeof y !== 'undefined' ? y : 0;
        font = typeof font !== 'undefined' ? font : "Cal";

        canvasContext.save();
        canvasContext.font = fontSize + " " + font;
        canvasContext.fillStyle = colour;
        canvasContext.fillText(text, x, y);
        canvasContext.restore();
    }
};
