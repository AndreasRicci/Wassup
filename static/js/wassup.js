'use strict';

window.addEventListener('load', function () {
    ///////////////////////////////////////////////////////////////////////
    // Deal with basic setup of the application data ("model" type stuff)
    ///////////////////////////////////////////////////////////////////////

    // Our user id
    var loggedInUserId = getLoggedInUserIdFromCookie();

    // Add our servers
    var serverModel = new ServerModel();
    var serverPrivate = new Server(SERVER_NAMES.private, SERVER_DISLAY_NAMES.private, SERVER_URLS.private, serverModel);
    var serverPublic = new Server(SERVER_NAMES.public, SERVER_DISLAY_NAMES.public, SERVER_URLS.public, serverModel);

    // Cancel AJAX requests when changing server
    serverModel.addListener(function (server) {
        abortAllAjax();
    });

    // Add our Pages
    var pageModel = new PageModel();
    var pageInstructions = new Page(PAGE_NAMES.instructions, "page-instructions", pageModel);
    var pageSendSups = new Page(PAGE_NAMES.send_sups, "page-send-sups", pageModel);
    var pageViewSups = new Page(PAGE_NAMES.view_sups, "page-view-sups", pageModel);

    // Other model(s)
    var friendListModel = new FriendListModel(serverModel);
    var supListModel = new SupListModel(serverModel);

    ///////////////////////////////////////////////////////////////////////
    // Deal with data input ("controller" type stuff)
    ///////////////////////////////////////////////////////////////////////

    // Add server selection links
    var selectServerPrivate = new ServerSelectionLink(serverPrivate, "choose-server-dropdown-selection-private", serverModel);
    var selectServerPublic = new ServerSelectionLink(serverPublic, "choose-server-dropdown-selection-public", serverModel);

    // Add nav bar links
    var linkInstructions = new NavBarLink(pageInstructions.name, "page-link-instructions", pageModel);
    var linkSendSups = new NavBarLink(pageSendSups.name, "page-link-send-sups", pageModel);
    var linkViewSups = new NavBarLink(pageViewSups.name, "page-link-view-sups", pageModel);

    ///////////////////////////////////////////////////////////////////////
    // Deal with data display ("view" type stuff)
    ///////////////////////////////////////////////////////////////////////

    setUpMessageBoxes(serverModel);

    // Server selection dropdown header updating
    var currentServerDisplay = document.getElementById("choose-server-dropdown-current-server");
    serverModel.addListener(function (server) {
        currentServerDisplay.innerHTML = server.displayName;
    });

    // Add friend form
    var addFriendForm = new AddFriendForm("add-friend-form-container", friendListModel);

    // Friend list table
    var friendListTable = new FriendListTable("friend-list-table-container", friendListModel, supListModel);

    // Viewing sups
    var supCarousel = new SupCarousel("carousel-container", supListModel);

    // Logout button
    var logoutUsername = document.getElementById("username");
    logoutUsername.innerHTML = loggedInUserId;

    // Select default server
    serverModel.selectServer(serverPrivate);

    // Select default page
    pageModel.selectPage(pageInstructions.name);
});

