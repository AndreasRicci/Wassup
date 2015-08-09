'use strict';

var SHOW_CLASS = "show"; // Class used to show an element
var HIDE_CLASS = "hidden"; // Class used to hide an element
var ACTIVE_CLASS = "active"; // Class used for navigation elements

var BUSY_CLASS = "currently-loading";
function indicateBusy(ele) {
    addClass(ele, BUSY_CLASS);
}
function indicateFree(ele) {
    removeClass(ele, BUSY_CLASS);
}

var indicateSuccess = null;
var dismissSuccess = null;

function indicateError(errorBoxId, msg) {
    dismissSuccess("success" + errorBoxId.substring(5));

    var errorBox = document.getElementById(errorBoxId);
    var message = errorBox.querySelector(".error_message");
    message.innerHTML = msg;

    addClass(errorBox, SHOW_CLASS);
}
function dismissError(errorBoxId) {
    var errorBox = document.getElementById(errorBoxId);
    removeClass(errorBox, SHOW_CLASS);
}

indicateSuccess = function (successBoxId, msg) {
    dismissError("error" + successBoxId.substring(7));

    var successBox = document.getElementById(successBoxId);
    var message = successBox.querySelector(".success_message");
    message.innerHTML = msg;

    addClass(successBox, SHOW_CLASS);
};
dismissSuccess = function (successBoxId) {
    var successBox = document.getElementById(successBoxId);
    removeClass(successBox, SHOW_CLASS);
};

function dismissAllMessageBoxes() {
    var boxes = document.getElementsByClassName("message-box");
    for (var i = 0; i < boxes.length; i++) {
        removeClass(boxes[i], SHOW_CLASS);
    }
}

function indicateInfo(infoBoxId, msg) {
    var infoBox = document.getElementById(infoBoxId);
    var message = infoBox.querySelector(".info_message");
    message.innerHTML = msg;

    addClass(infoBox, SHOW_CLASS);
}

function setUpErrorBoxes() {
    // TODO: Clean this up

    var boxes = document.getElementsByClassName("page-error-message-container");
    var box0 = boxes[0];
    var button0 = box0.querySelector(".close-error-box");
    button0.addEventListener("click", function () {
        removeClass(box0, SHOW_CLASS);
    });

    var box1 = boxes[1];
    var button1 = box1.querySelector(".close-error-box");
    button1.addEventListener("click", function () {
        removeClass(box1, SHOW_CLASS);
    });
}

function setUpSuccessBoxes() {
    // TODO: Clean this up

    var boxes = document.getElementsByClassName("page-success-message-container");
    var box0 = boxes[0];
    var button0 = box0.querySelector(".close-error-box");
    button0.addEventListener("click", function () {
        removeClass(box0, SHOW_CLASS);
    });

    var box1 = boxes[1];
    var button1 = box1.querySelector(".close-error-box");
    button1.addEventListener("click", function () {
        removeClass(box1, SHOW_CLASS);
    });
}

function setUpInfoBoxes() {
    // TODO: Clean this up

    var boxes = document.getElementsByClassName("page-info-message-container");
    var box0 = boxes[0];
    var button0 = box0.querySelector(".close-error-box");
    button0.addEventListener("click", function () {
        removeClass(box0, SHOW_CLASS);
    });
}

function setUpMessageBoxes(serverModel) {
    setUpErrorBoxes();
    setUpSuccessBoxes();
    setUpInfoBoxes();

    serverModel.addListener(function (server) {
        dismissAllMessageBoxes(); // Dismiss message boxes when we switch servers
    });
}

/**
 * Page.
 * @param name Used for internal referencing
 * @param pageId Id of the element where the page content is stored
 * @param pageModel The page model (see model.js)
 * @constructor
 */
var Page = function (name, pageId, pageModel) {
    this.name = name;
    this.container = document.getElementById(pageId);

    var that = this;

    this.handlePageSelectEvent = function (pageName) {
        if (pageName === that.name) {
            addClass(that.container, SHOW_CLASS);
        } else {
            removeClass(that.container, SHOW_CLASS);
        }
    };

    // Wire up a default page change event handler
    pageModel.addListener(this.handlePageSelectEvent);

    // Let the page model know we are available
    pageModel.addAvailablePageName(this.name);
};

/**
 * Nav bar link.
 * @param pageName Name of page it links to
 * @param linkId Id of the element where the link is held
 * @param pageModel The page model (see model.js)
 * @constructor
 */
var NavBarLink = function (pageName, linkId, pageModel) {
    this.pageName = pageName;
    this.link = document.getElementById(linkId);

    var that = this;

    this.handlePageSelectEvent = function (pageName) {
        if (pageName === that.pageName) {
            addClass(that.link.parentNode, ACTIVE_CLASS);
        } else {
            removeClass(that.link.parentNode, ACTIVE_CLASS);
        }
    };

    // React to the link being clicked
    this.link.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the URL from changing

        pageModel.selectPage(that.pageName);

        that.link.blur(); // Remove focus
    });

    // Wire up a default page change event handler
    pageModel.addListener(this.handlePageSelectEvent);
};

/**
 * ServerSelectionLink
 * @param server Server it links to connect to
 * @param linkId Id of the element where the link is held
 * @param serverModel The server model (see model.js)
 * @constructor
 */
var ServerSelectionLink = function (server, linkId, serverModel) {
    this.server = server;
    this.link = document.getElementById(linkId);

    var that = this;

    this.handleServerSelectEvent = function (server) {
        if (server === that.server) {
            addClass(that.link.parentNode, HIDE_CLASS);
        } else {
            removeClass(that.link.parentNode, HIDE_CLASS);
        }
    };

    // React to the link being clicked
    this.link.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the URL from changing

        serverModel.selectServer(that.server);

        that.link.blur(); // Remove focus
    });

    // Wire up a default server change event handler
    serverModel.addListener(this.handleServerSelectEvent);
};

var FriendListTable = function (containerId, friendListModel, supListModel) {
    this.container = document.getElementById(containerId);

    this.supsButton = this.container.querySelector("#send-sups-button");
    this.tableBody = this.container.querySelector("tbody");
    this.entryTemplate = this.container.querySelector("#friend-list-table-entry-template");

    var that = this;

    // Sups sending
    this.supsButton.addEventListener("click", function () {
        // Gather all checked
        var checkboxes = document.getElementsByClassName("send-to-checkbox");
        var sendToIds = [];
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                sendToIds.push(checkboxes[i].getAttribute("id").substring(11));
            }
        }

        if (sendToIds.length > 0) {
            supListModel.sendSupsTo(sendToIds);
        } else {
            indicateError("error-message-send-sups", "Please select one or more friends to send to using the checkboxes to the left.");
        }
    });

    this.handleSupSendingEvents = function (eventType, eventData) {
        switch (eventType) {
            case SUPS_SEND_BEGIN_EVENT:
                indicateBusy(that.container);
                dismissError("error-message-send-sups");
                dismissSuccess("success-message-send-sups");
                break;
            case SUPS_SEND_ERROR_EVENT:
                indicateFree(that.container);
                indicateError("error-message-send-sups", "Sent sups to all friends you selected EXCEPT those friends who are still selected below (whose IDs are: " + eventData.errorWhileTryingToSendToIds.join(", ") + ").");
                break;
            case SUPS_SENT_EVENT:
                indicateFree(that.container);
                indicateSuccess("success-message-send-sups", "Sent sups to all friends you selected (whose IDs are: " + eventData.sentSuccessfullyToIds.join(", ") + ").");
                break;
            case SUP_SEND_ERROR_EVENT:
                // Do nothing
                break;
            case SUP_SENT_EVENT:
                var row = that.tableBody.querySelector("#friendListTableEntryForUserWithId" + eventData.sendToId);
                var checkbox = row.querySelector(".send-to-checkbox");
                var checkboxText = row.querySelector(".send-to-text");
                checkbox.checked = false;
                checkboxText.innerHTML = "No";
                removeClass(row, "checked");
                break;
            default:
            // Ignore other event types
        }
    };

    this.handleDataChangeEvent = function (eventType, eventData) {
        switch (eventType) {
            case FRIEND_ADDED_EVENT:
                // Create new entry from the template
                var newEntry = document.importNode(that.entryTemplate.content, true);
                newEntry.querySelector("tr").setAttribute("id", "friendListTableEntryForUserWithId" + eventData.id);

                var entryCells = newEntry.querySelectorAll("td");
                entryCells[1].textContent = eventData.fullName;
                entryCells[2].textContent = eventData.id;

                // Wire up checkbox
                var checkbox = entryCells[0].querySelector(".send-to-checkbox");
                checkbox.setAttribute("id", "send-to-ID-" + eventData.id);
                var checkboxText = entryCells[0].querySelector(".send-to-text");
                checkbox.addEventListener("change", function () {
                    var checked = checkbox.checked;
                    checkboxText.innerHTML = checked ? "Yes" : "No";

                    var row = that.tableBody.querySelector("#friendListTableEntryForUserWithId" + eventData.id);
                    if (checked) {
                        addClass(row, "checked");
                    } else {
                        removeClass(row, "checked");
                    }
                });

                // Wire up the remove button
                var removeButton = newEntry.querySelector(".remove-friend");
                removeButton.addEventListener("click", function () {
                    friendListModel.removeFriend(eventData);

                    removeButton.blur(); // Remove focus
                });

                // Add new entry to beginning of table
                that.tableBody.insertBefore(newEntry, that.tableBody.firstChild);

                if (eventData.syncToServer) {
                    indicateFree(that.container);
                    indicateSuccess("success-message-send-sups", "Added user with ID " + eventData.id + " to friend list.");
                }
                break;
            case FRIEND_REMOVED_EVENT:
                removeElementById("friendListTableEntryForUserWithId" + eventData.id);

                if (eventData.syncToServer) {
                    indicateFree(that.container);
                    indicateSuccess("success-message-send-sups", "Removed user with ID " + eventData.id + " from friend list.");
                }
                break;
            case FRIENDS_REFRESHED_EVENT:
                indicateFree(that.container);
                dismissError("error-message-send-sups");
                dismissSuccess("success-message-send-sups");
                break;
            case FRIEND_ADD_SYNC_BEGIN_EVENT: // Fall through
            case FRIEND_REMOVE_SYNC_BEGIN_EVENT: // Fall though
            case FRIENDS_REFRESH_BEGIN_EVENT:
                indicateBusy(that.container);
                break;
            case FRIEND_ADD_SYNC_ERROR_EVENT:
                indicateFree(that.container);
                indicateError("error-message-send-sups", "Could not add friend with ID " + eventData.id + ". " + eventData.serverError + ".");
                break;
            case FRIEND_REMOVE_SYNC_ERROR_EVENT:
                indicateFree(that.container);
                indicateError("error-message-send-sups", "Could not remove friend with ID " + eventData.id + ". " + eventData.serverError + ".");
                break;
            case FRIENDS_REFRESH_ERROR_EVENT:
                indicateFree(that.container);
                indicateError("error-message-send-sups", "Error refreshing friend list from server. " + eventData.serverError + ".");
                break;
            default:
                indicateFree(that.container);
                dismissError("error-message-send-sups");
                dismissSuccess("success-message-send-sups");
                console.log("ERROR: Got event type '" + eventType);
        }
    };

    // Wire up a default sup send event handler
    supListModel.addListener(this.handleSupSendingEvents);

    // Wire up a default data change event handler
    friendListModel.addListener(this.handleDataChangeEvent);
};

var AddFriendForm = function (containerId, friendListModel) {
    this.container = document.getElementById(containerId);

    this.form = this.container.querySelector("#add-friend-form");
    this.input = this.container.querySelector("#friend_user_id");
    this.button = this.container.querySelector("#add_friend_button");

    var that = this;

    this.form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Process form

        var id = that.input.value.trim();
        if (id.length == 0) return false;

        if (id == getLoggedInUserIdFromCookie()) {
            indicateError("error-message-send-sups", "You can't add yourself as a friend.");
            return false;
        }

        if (friendListModel.friendExistsWithId(id)) {
            indicateError("error-message-send-sups", "You already have a friend with User ID " + id + ".");
            return false;
        }

        // Everything is validated, so add the friend
        var newFriend = new Friend(id, "Refresh Server For Name");
        friendListModel.addFriend(newFriend);

        return false;
    });

    this.enableForm = function () {
        this.input.disabled = false;
        this.button.disabled = false;
    };

    this.disableForm = function () {
        this.input.disabled = true;
        this.button.disabled = true;
    };

    this.handleDataChangeEvent = function (eventType, eventData) {
        switch (eventType) {
            case FRIEND_ADD_SYNC_BEGIN_EVENT: // Fall through
            case FRIEND_REMOVE_SYNC_BEGIN_EVENT: // Fall though
            case FRIENDS_REFRESH_BEGIN_EVENT:
                that.disableForm();
                break;
            case FRIEND_ADDED_EVENT:
                if (eventData.syncToServer) {
                    that.enableForm();
                    that.input.value = "";
                }

                break;
            case FRIEND_REMOVED_EVENT:
                if (eventData.syncToServer) {
                    that.enableForm();
                }

                break;
            case FRIENDS_REFRESHED_EVENT:
                that.enableForm();
                that.input.value = "";

                break;
            case FRIEND_ADD_SYNC_ERROR_EVENT: // Fall through
            case FRIEND_REMOVE_SYNC_ERROR_EVENT: // Fall through
            case FRIENDS_REFRESH_ERROR_EVENT:
                that.enableForm();
                break;
            default:
                that.enableForm();
                console.log("ERROR: Got event type '" + eventType);
        }
    };

    // Wire up a default data change event handler
    friendListModel.addListener(this.handleDataChangeEvent);
};

var SupCarousel = function (containerId, supListModel) {
    this.container = document.getElementById(containerId);

    this.outerContainer = document.getElementById("outer-container");
    this.sups = this.container.querySelector("#sups");
    this.carousel = this.container.querySelector("#sup-carousel");
    this.supTemplate = this.container.querySelector("#sup-template");
    this.noSupsMessage = document.getElementById("no-sups");

    var that = this;

    function drawForSupWithId(elementId) {
        var ele = that.sups.querySelector("#" + elementId);
        var canvas = ele.querySelector(".sup-canvas");
        if (canvas) {
            return; // Already drew this before
        }

        var supData = JSON.parse(ele.getAttribute('data-sup'));

        // Create the canvas
        var canvasFragment = create('<div class="canvas-container"><canvas class="sup-canvas"></canvas></div>');
        prependChild(canvasFragment, ele);

        // Wire up the remove button
        var removeButton = ele.querySelector(".remove-sup");
        removeButton.addEventListener("click", function () {
            supListModel.removeSup(supData);

            removeButton.blur(); // Remove focus
        });

        // Fill in caption
        var totalSups = ele.querySelector(".total-sups");
        var supNumber = ele.querySelector(".sup-number");
        var senderId = ele.querySelector(".sup-sender-id");
        var supDate = ele.querySelector(".sup-date");

        senderId.innerHTML = supData.sender_id;
        supDate.innerHTML = new Date(supData.date).toLocaleString();

        var updatePositions = function () {
            totalSups.innerHTML = supListModel.totalSups();
            supNumber.innerHTML = supListModel.locationFromBack(supData);
        };
        updatePositions();
        supListModel.addListener(updatePositions);

        // Canvas drawing settings
        var canvas = ele.querySelector(".sup-canvas");
        var w = canvas.width;
        var h = canvas.height;
        var key = 'canvasSettingsForSupWithId' + supData.sup_id;
        var settings = {};
        var settingsString = localStorage.getItem(key);
        if (settingsString) {
            settings = JSON.parse(settingsString);
        } else {
            settings = {
                canvasRotation: rand(0, 20),
                fontSize: rand(30, 50),
                fontColour: getRandomColor(),
                textX: rand(w / 4, w / 2),
                textY: rand(h / 5, h / 3)
            };
            localStorage.setItem(key, JSON.stringify(settings));
        }

        // Draw
        var canvasContext = canvas.getContext('2d');
        canvasContext.save();
        canvasContext.rotate(settings.canvasRotation * Math.PI / 180);
        canvasDraw.text(canvasContext, "Sup?", settings.fontSize, settings.fontColour, settings.textX, settings.textY);
        canvasContext.restore();
    }

    // This line is needed to interact with the carousel without it scrolling automatically (jQuery from Bootstrap's site - required here and just below)
    $('.carousel')
        .carousel({interval: false})
        .on('slide.bs.carousel', function (e) {
            drawForSupWithId(e.relatedTarget.getAttribute("id"));
        });

    function numSups() {
        return that.sups.getElementsByClassName("sup").length;
    }

    function hasSups() {
        return numSups() > 0;
    }

    function resetClasses() {
        if (!hasSups()) return;

        var sups = that.sups.getElementsByClassName("sup");
        _.each(
            sups,
            function (sup) {
                removeClass(sup, ACTIVE_CLASS);
            }
        );

        // Make first the active one
        var first = that.sups.querySelector(".sup");
        addClass(first, ACTIVE_CLASS);

        drawForSupWithId(first.getAttribute("id"));
    }

    this.handleSupEvents = function (eventType, eventData) {
        switch (eventType) {
            case SUP_REMOVE_SYNC_BEGIN_EVENT: // Fall through
            case SUPS_REFRESH_BEGIN_EVENT:
                indicateBusy(that.outerContainer);
                break;
            case SUP_REMOVE_SYNC_ERROR_EVENT:
                indicateFree(that.outerContainer);
                indicateError("error-message-view-sups", "Could not remove sup from user with ID " + eventData.sender_id + ". " + eventData.serverError + ".");
                break;
            case SUPS_REFRESH_ERROR_EVENT:
                indicateFree(that.outerContainer);
                break;
            case SUPS_REFRESHED_EVENT:
                resetClasses();
                indicateFree(that.outerContainer);
                break;
            case SUP_ADDED_EVENT:
                var addingFirst = !hasSups();

                // Create new Sup from the template
                var newSup = document.importNode(that.supTemplate.content, true);
                newSup.querySelector(".sup").setAttribute("id", "supForId" + eventData.sup_id);
                newSup.querySelector(".sup").setAttribute("data-sup", JSON.stringify(eventData));

                // Add new sup to beginning carousel
                prependChild(newSup, that.sups);

                // Add active class to first child if needed
                if (addingFirst) {
                    addClass(that.sups.querySelector(".sup"), ACTIVE_CLASS);

                    if (eventData.syncToServer) {
                        drawForSupWithId("supForId" + eventData.sup_id);
                    }
                }

                // We were updated with this new sup, so notify the user
                if (eventData.syncToServer) {
                    indicateInfo("info-message-view-sups", "Your friend with ID " + eventData.sender_id + " just sent you a sup!" + (addingFirst ? "" : " Navigate to the left below to see it."));
                }
                break;
            case SUP_REMOVED_EVENT:
                var removing = that.sups.querySelector("#supForId" + eventData.sup_id);

                // Removing the thing currently being viewed?
                if (hasClass(removing, ACTIVE_CLASS) && numSups() > 1) {
                    // Add active class to next sibling
                    var nextSibling = getNextValidSibling(removing);
                    if (nextSibling) {
                        addClass(nextSibling, ACTIVE_CLASS);
                        drawForSupWithId(nextSibling.getAttribute("id"));
                    } else {
                        // Nothing to the right, so move to the left
                        var prevSibling = getPrevValidSibling(removing);
                        addClass(prevSibling, ACTIVE_CLASS);
                        drawForSupWithId(prevSibling.getAttribute("id"));
                    }
                }

                removeElement(removing);

                if (eventData.syncToServer) {
                    indicateFree(that.outerContainer);
                    indicateSuccess("success-message-view-sups", "Removed sup from user with ID " + eventData.sender_id + ".");
                }
                break;
            default:
            // Ignore other event types
        }

        if (hasSups()) {
            addClass(that.noSupsMessage, HIDE_CLASS);
            removeClass(that.carousel, HIDE_CLASS);
        } else {
            removeClass(that.noSupsMessage, HIDE_CLASS);
            addClass(that.carousel, HIDE_CLASS);
        }
    };

    // Wire up a default sup event handler
    supListModel.addListener(this.handleSupEvents);
};
