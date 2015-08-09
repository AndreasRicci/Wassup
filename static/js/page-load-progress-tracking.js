'use strict';

// Page load tracking, with help from: http://stackoverflow.com/questions/11072759/display-a-loading-bar-before-the-entire-page-is-loaded
(function () {
    function pageLoadProgressTracking() {
        var overlay = document.getElementById("page-loading-progress-container");
        var progressBar = document.getElementById("page-loading-progress-bar");
        var progressPercent = document.getElementById("page-loading-progress-percent");
        var allImages = document.images;
        var totalImages = allImages.length;
        var totalImagesLoaded = 0;

        var imageLoadedOrError = function () {
            totalImagesLoaded++;

            var newPercentLoaded = (100 / totalImages * totalImagesLoaded) << 0;
            progressBar.setAttribute("aria-valuenow", newPercentLoaded);
            progressBar.style.width = newPercentLoaded + "%";
            progressPercent.innerHTML = newPercentLoaded + "%";

            if (totalImagesLoaded == totalImages) {
                loadingComplete();
            }
        };

        var loadingComplete = function () {
            overlay.style.opacity = 0; // Fade out the overlay

            setTimeout(function () {
                overlay.style.display = "none"; // Get rid of the overlay after fading it out
                progressBar.setAttribute("aria-valuenow", 0);
                progressBar.style.width = "0%";
                progressPercent.innerHTML = "0%";
            }, 750);
        };

        for (var i = 0; i < totalImages; i++) {
            var image = new Image();
            image.onload = imageLoadedOrError;
            image.onerror = imageLoadedOrError;
            image.src = allImages[i].src;
        }
    }

    document.addEventListener("DOMContentLoaded", pageLoadProgressTracking, false);
}());
