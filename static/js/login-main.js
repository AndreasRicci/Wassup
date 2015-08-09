'use strict';

window.addEventListener('load', function () {
    // Set Full Name cookie when form submits
    var form = document.getElementById("login-form");
    form.addEventListener("submit", function () {
        var fullNameInput = form.querySelector("#full_name");
        var full_name = fullNameInput.value;
        setLoggedInFullNameFromCookie(full_name);
    });
});

