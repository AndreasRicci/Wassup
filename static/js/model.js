'use strict';

// TODO: Create a "Server" enum with these
var SERVER_NAMES = {
    private: "private",
    public: "public"
};

var SERVER_DISLAY_NAMES = {
    private: "Private",
    public: "Public"
};

var SERVER_URLS = {
    private: "http://localhost:8080",
    public: "http://104.197.3.113"
};

var PROTOCOL_VERSION = "1.1";

var Server = function (serverName, displayName, url, serverModel) {
    this.name = serverName;
    this.displayName = displayName;
    this.url = url;
    this.ajaxUrl = this.url + "/post";

    // Let the server model know we are available
    serverModel.addAvailableServer(this);
};
_.extend(Server.prototype, {
    createUser: function (userId, fullName, onSuccess, onError) {
        var objectToSend = {
            protocol_version: PROTOCOL_VERSION,
            message_id: generateMessageId(),
            command: "create_user",
            command_data: {user_id: userId, full_name: fullName},
            user_id: userId
        };
        ajax(this.ajaxUrl, objectToSend, onSuccess, onError);
    },

    userExists: function (userId, onSuccess, onError) {
        var objectToSend = {
            protocol_version: PROTOCOL_VERSION,
            message_id: generateMessageId(),
            command: "user_exists",
            command_data: {user_id: userId},
            user_id: getLoggedInUserIdFromCookie()
        };
        ajax(this.ajaxUrl, objectToSend, onSuccess, onError);
    },

    getFriends: function (onSuccess, onError, calledAfterUserCreated) {
        // Standard "must have account on server" part
        calledAfterUserCreated = typeof calledAfterUserCreated !== 'undefined' ? calledAfterUserCreated : false;
        var that = this;
        var userId = getLoggedInUserIdFromCookie();
        if (this.name == SERVER_NAMES.public && !calledAfterUserCreated) {
            var fullName = getLoggedInFullNameFromCookie();

            var onUserCreateSuccess = function () {
                that.getFriends(onSuccess, onError, true);
            };
            this.createUser(userId, fullName, onUserCreateSuccess, onError);

            return;
        }

        var objectToSend = {
            protocol_version: PROTOCOL_VERSION,
            message_id: generateMessageId(),
            command: "get_friends",
            command_data: {user_id: userId},
            user_id: userId
        };
        ajax(this.ajaxUrl, objectToSend, onSuccess, onError);
    },

    addFriend: function (onSuccess, onError, friendId, calledAfterUserCreated) {
        // Standard "must have account on server" part
        calledAfterUserCreated = typeof calledAfterUserCreated !== 'undefined' ? calledAfterUserCreated : false;
        var that = this;
        var userId = getLoggedInUserIdFromCookie();
        if (this.name == SERVER_NAMES.public && !calledAfterUserCreated) {
            var fullName = getLoggedInFullNameFromCookie();

            var onUserCreateSuccess = function () {
                that.addFriend(onSuccess, onError, friendId, true);
            };
            this.createUser(userId, fullName, onUserCreateSuccess, onError);

            return;
        }

        // Must check if the user we're adding exists
        var onUserExistsSuccess = function (protocol_version, error, command, message_id, reply_data) {
            if (!reply_data.exists) {
                onError(protocol_version, "User with id " + reply_data.user_id + " does not exist", command, message_id, reply_data);
                return;
            }

            // Finally add friend
            var objectToSend = {
                protocol_version: PROTOCOL_VERSION,
                message_id: generateMessageId(),
                command: "add_friend",
                command_data: {user_id: friendId},
                user_id: userId
            };
            ajax(that.ajaxUrl, objectToSend, onSuccess, onError);
        };
        this.userExists(friendId, onUserExistsSuccess, onError);
    },

    removeFriend: function (onSuccess, onError, friendId, calledAfterUserCreated) {
        // Standard "must have account on server" part
        calledAfterUserCreated = typeof calledAfterUserCreated !== 'undefined' ? calledAfterUserCreated : false;
        var that = this;
        var userId = getLoggedInUserIdFromCookie();
        if (this.name == SERVER_NAMES.public && !calledAfterUserCreated) {
            var fullName = getLoggedInFullNameFromCookie();

            var onUserCreateSuccess = function () {
                that.removeFriend(onSuccess, onError, friendId, true);
            };
            this.createUser(userId, fullName, onUserCreateSuccess, onError);

            return;
        }

        // Must check if the user we're removing exists
        var onUserExistsSuccess = function (protocol_version, error, command, message_id, reply_data) {
            if (!reply_data.exists) {
                onError(protocol_version, "User with id " + reply_data.user_id + " does not exist", command, message_id, reply_data);
                return;
            }

            // Finally add friend
            var objectToSend = {
                protocol_version: PROTOCOL_VERSION,
                message_id: generateMessageId(),
                command: "remove_friend",
                command_data: {user_id: friendId},
                user_id: userId
            };
            ajax(that.ajaxUrl, objectToSend, onSuccess, onError);
        };
        this.userExists(friendId, onUserExistsSuccess, onError);
    },

    sendSup: function (onSuccess, onError, send_to_id, sup_id, date, calledAfterUserCreated) {
        // Standard "must have account on server" part
        calledAfterUserCreated = typeof calledAfterUserCreated !== 'undefined' ? calledAfterUserCreated : false;
        var that = this;
        var userId = getLoggedInUserIdFromCookie();
        if (this.name == SERVER_NAMES.public && !calledAfterUserCreated) {
            var fullName = getLoggedInFullNameFromCookie();

            var onUserCreateSuccess = function () {
                that.sendSup(onSuccess, onError, send_to_id, sup_id, date, true);
            };
            this.createUser(userId, fullName, onUserCreateSuccess, onError);

            return;
        }

        //  Add the sup
        var objectToSend = {
            protocol_version: PROTOCOL_VERSION,
            message_id: generateMessageId(),
            command: "send_sup",
            command_data: {user_id: send_to_id, sup_id: sup_id, date: date},
            user_id: userId
        };
        ajax(this.ajaxUrl, objectToSend, onSuccess, onError);
    },

    removeSup: function (onSuccess, onError, sup_id, calledAfterUserCreated) {
        // Standard "must have account on server" part
        calledAfterUserCreated = typeof calledAfterUserCreated !== 'undefined' ? calledAfterUserCreated : false;
        var that = this;
        var userId = getLoggedInUserIdFromCookie();
        if (this.name == SERVER_NAMES.public && !calledAfterUserCreated) {
            var fullName = getLoggedInFullNameFromCookie();

            var onUserCreateSuccess = function () {
                that.removeSup(onSuccess, onError, sup_id, true);
            };
            this.createUser(userId, fullName, onUserCreateSuccess, onError);

            return;
        }

        // Remove the sup
        var objectToSend = {
            protocol_version: PROTOCOL_VERSION,
            message_id: generateMessageId(),
            command: "remove_sup",
            command_data: {sup_id: sup_id},
            user_id: userId
        };
        ajax(that.ajaxUrl, objectToSend, onSuccess, onError);
    },

    getSups: function (onSuccess, onError, calledAfterUserCreated) {
        // Standard "must have account on server" part
        calledAfterUserCreated = typeof calledAfterUserCreated !== 'undefined' ? calledAfterUserCreated : false;
        var that = this;
        var userId = getLoggedInUserIdFromCookie();
        if (this.name == SERVER_NAMES.public && !calledAfterUserCreated) {
            var fullName = getLoggedInFullNameFromCookie();

            var onUserCreateSuccess = function () {
                that.getSups(onSuccess, onError, true);
            };
            this.createUser(userId, fullName, onUserCreateSuccess, onError);

            return;
        }

        var objectToSend = {
            protocol_version: PROTOCOL_VERSION,
            message_id: generateMessageId(),
            command: "get_sups",
            command_data: {},
            user_id: userId
        };
        ajax(this.ajaxUrl, objectToSend, onSuccess, onError);
    },
});

/**
 * An object which tracks server related data.
 * @constructor
 */
var ServerModel = function () {
    // What server are we currently connected to?
    this.currentlySelectedServer = null;

    // All available servers
    this.availableServers = [];

    // Callback functions with the signature as described below
    this.listeners = [];
};
_.extend(ServerModel.prototype, {

    /**
     * Add a listener to the listeners we track.
     * @param listener The listener is a callback function with the following signature:
     * (eventData) where eventData indicates the new Server.
     */
    addListener: function (listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function (listener) {
        this.listeners = _.without(this.listeners, listener);
    },

    /**
     * Should return the currently selected Server.
     */
    getCurrentlySelectedServer: function () {
        return this.currentlySelectedServer;
    },

    /**
     * Returns a list of Servers that can be selected by the user.
     */
    getAvailableServers: function () {
        return this.availableServers;
    },

    /**
     * Adds to the list of available Servers
     */
    addAvailableServer: function (server) {
        this.availableServers.push(server)
    },

    /**
     * Changes the currently selected Server to the Server given. Should
     * broadcast an event to all listeners that the Server changed.
     * @param server
     */
    selectServer: function (server) {
        if (this.currentlySelectedServer == server) {
            return;
        }

        // Change the Server
        this.currentlySelectedServer = server;

        // Notify listeners that the Server has changed
        _.each(
            this.listeners,
            function (listener) {
                listener(server);
            }
        );
    }
});

var PAGE_NAMES = {
    instructions: "instructions",
    send_sups: "send_sups",
    view_sups: "view_sups"
};

/**
 * An object which tracks page related data.
 * @constructor
 */
var PageModel = function () {
    // What page are we currently looking at?
    this.currentlySelectedPageName = null;

    // All available page names
    this.availablePageNames = [];

    // Callback functions with the signature as described below
    this.listeners = [];
};
_.extend(PageModel.prototype, {

    /**
     * Add a listener to the listeners we track.
     * @param listener The listener is a callback function with the following signature:
     * (eventData) where eventData indicates the name of the new page.
     */
    addListener: function (listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function (listener) {
        this.listeners = _.without(this.listeners, listener);
    },

    /**
     * Should return the name of the currently selected page.
     */
    getNameOfCurrentlySelectedPage: function () {
        return this.currentlySelectedPageName;
    },

    /**
     * Returns a list of pages (strings) that can be selected by the user.
     */
    getAvailablePageNames: function () {
        return this.availablePageNames;
    },

    /**
     * Adds to the list of available page names
     */
    addAvailablePageName: function (pageName) {
        this.availablePageNames.push(pageName)
    },

    /**
     * Changes the currently selected page to the page name given. Should
     * broadcast an event to all listeners that the page changed.
     * @param pageName
     */
    selectPage: function (pageName) {
        if (this.currentlySelectedPageName == pageName) {
            return;
        }

        // Change the page
        this.currentlySelectedPageName = pageName;

        // Notify listeners that the page has changed
        _.each(
            this.listeners,
            function (listener) {
                listener(pageName);
            }
        );
    }
});

var Friend = function (id, fullName) {
    this.id = id;
    this.fullName = fullName;
};

var FRIEND_ADD_SYNC_BEGIN_EVENT = "FRIEND_ADD_SYNC_BEGIN_EVENT"; // Since we sync with server
var FRIEND_ADD_SYNC_ERROR_EVENT = "FRIEND_ADD_SYNC_ERROR_EVENT"; // Since we sync with server
var FRIEND_ADDED_EVENT = "FRIEND_ADDED_EVENT";
var FRIEND_REMOVE_SYNC_BEGIN_EVENT = "FRIEND_REMOVE_SYNC_BEGIN_EVENT"; // Since we sync with server
var FRIEND_REMOVE_SYNC_ERROR_EVENT = "FRIEND_REMOVE_SYNC_ERROR_EVENT"; // Since we sync with server
var FRIEND_REMOVED_EVENT = "FRIEND_REMOVED_EVENT";

var FRIENDS_REFRESH_BEGIN_EVENT = "FRIENDS_REFRESH_BEGIN_EVENT"; // When refreshing completely from server
var FRIENDS_REFRESH_ERROR_EVENT = "FRIENDS_REFRESH_ERROR_EVENT"; // When refreshing completely from server
var FRIENDS_REFRESHED_EVENT = "FRIENDS_REFRESHED_EVENT"; // When refreshing completely from server

var FriendListModel = function (serverModel) {
    this.server = null;

    var that = this;
    var handleServerSelectEvent = function (server) {
        that.server = server;
        that.refreshFromServer();
    };
    serverModel.addListener(handleServerSelectEvent);

    // All friends
    this.friends = [];

    // Callback functions with the signature as described below
    this.listeners = [];
};
_.extend(FriendListModel.prototype, {

    addListener: function (listener) {
        this.listeners.push(listener);
    },

    removeListener: function (listener) {
        this.listeners = _.without(this.listeners, listener);
    },

    friendExistsWithId: function (id) {
        return _.findWhere(this.friends, {'id': id}) ? true : false;
    },

    addFriend: function (friend, syncToServer) {
        syncToServer = typeof syncToServer !== 'undefined' ? syncToServer : true;

        if (typeof friend.id === 'undefined') return;
        if (typeof friend.fullName === 'undefined') return;

        if (this.friendExistsWithId(friend.id)) return; // Friend already in list

        var that = this;

        friend.syncToServer = syncToServer; // Are we syncing to server or not? (Helpful for event listeners)

        // Local changes upon success
        var syncFinishedWithoutError = function () {
            var finallyAddFriend = function () {
                that.friends.push(friend);
                _.each(
                    that.listeners,
                    function (listener) {
                        listener(FRIEND_ADDED_EVENT, friend);
                    }
                );
            };

            if (syncToServer) {
                // Get full name of new friend, if possible
                var onSuccess = function (protocol_version, error, command, message_id, reply_data) {
                    var kvpList = reply_data;
                    _.each(
                        kvpList,
                        function (kvp) {
                            if (friend.id == kvp.user_id) {
                                friend.fullName = kvp.full_name;
                            }
                        }
                    );

                    finallyAddFriend();
                };
                var onError = function (protocol_version, error, command, message_id, reply_data) {
                    finallyAddFriend(); // Friend will be added with default full name
                };
                that.server.getFriends(onSuccess, onError);
            } else {
                finallyAddFriend(); // Not syncing, so add right away
            }
        };

        // No syncing, so it's all local changes
        if (!syncToServer) {
            syncFinishedWithoutError();
            return;
        }

        // Start syncing with server
        _.each(
            this.listeners,
            function (listener) {
                listener(FRIEND_ADD_SYNC_BEGIN_EVENT, friend);
            }
        );

        // Do this if there was an error while trying to sync
        var syncFinishedWithError = function (serverError) {
            friend.serverError = serverError;
            _.each(
                that.listeners,
                function (listener) {
                    listener(FRIEND_ADD_SYNC_ERROR_EVENT, friend);
                }
            );
        };

        // Ajax stuff
        var onSuccess = function (protocol_version, error, command, message_id, reply_data) {
            syncFinishedWithoutError();
        };
        var onError = function (protocol_version, error, command, message_id, reply_data) {
            syncFinishedWithError(error);
        };
        this.server.addFriend(onSuccess, onError, friend.id);
    },

    refreshFromServer: function () {
        var that = this;

        // Start refreshing from server
        _.each(
            this.listeners,
            function (listener) {
                listener(FRIENDS_REFRESH_BEGIN_EVENT, {syncToServer: false});
            }
        );

        // Remove all friends locally
        this.removeAllFriends(false);

        // Local changes upon success
        var refreshFinishedWithoutError = function () {
            _.each(
                that.listeners,
                function (listener) {
                    listener(FRIENDS_REFRESHED_EVENT, {syncToServer: false});
                }
            );
        };

        // Do this if there was an error while trying to refresh
        var refreshFinishedWithError = function (serverError) {
            _.each(
                that.listeners,
                function (listener) {
                    listener(FRIENDS_REFRESH_ERROR_EVENT, {syncToServer: false, serverError: serverError});
                }
            );
        };

        // Ajax stuff
        var onSuccess = function (protocol_version, error, command, message_id, reply_data) {
            var kvpList = reply_data;
            _.each(
                kvpList,
                function (kvp) {
                    var newFriend = new Friend(kvp.user_id, kvp.full_name);
                    that.addFriend(newFriend, false);
                }
            );

            refreshFinishedWithoutError();
        };
        var onError = function (protocol_version, error, command, message_id, reply_data) {
            refreshFinishedWithError(error);
        };
        this.server.getFriends(onSuccess, onError);
    },

    removeFriend: function (friend, syncToServer) {
        syncToServer = typeof syncToServer !== 'undefined' ? syncToServer : true;

        if (!this.friendExistsWithId(friend.id)) return; // Friend not in list

        var that = this;

        friend.syncToServer = syncToServer; // Are we syncing to server or not? (Helpful for event listeners)

        // Local changes upon success
        var syncFinishedWithoutError = function () {
            that.friends = _.without(that.friends, _.findWhere(that.friends, {id: friend.id}));
            _.each(
                that.listeners,
                function (listener) {
                    listener(FRIEND_REMOVED_EVENT, friend);
                }
            );
        };

        // No syncing, so it's all local changes
        if (!syncToServer) {
            syncFinishedWithoutError();
            return;
        }

        // Start syncing with server
        _.each(
            this.listeners,
            function (listener) {
                listener(FRIEND_REMOVE_SYNC_BEGIN_EVENT, friend);
            }
        );

        // Do this if there was an error while trying to sync
        var syncFinishedWithError = function (serverError) {
            friend.serverError = serverError;
            _.each(
                that.listeners,
                function (listener) {
                    listener(FRIEND_REMOVE_SYNC_ERROR_EVENT, friend);
                }
            );
        };

        // Ajax stuff
        var onSuccess = function (protocol_version, error, command, message_id, reply_data) {
            syncFinishedWithoutError();
        };
        var onError = function (protocol_version, error, command, message_id, reply_data) {
            syncFinishedWithError(error);
        };
        this.server.removeFriend(onSuccess, onError, friend.id);
    },

    removeAllFriends: function (syncToServer) {
        syncToServer = typeof syncToServer !== 'undefined' ? syncToServer : true;

        var that = this;

        _.each(
            this.friends,
            function (friend) {
                that.removeFriend(friend, syncToServer);
            }
        );
    },

    getFriends: function () {
        return this.friends;
    }
});

var SUP_ADDED_EVENT = "SUP_ADDED_EVENT";
var SUP_REMOVE_SYNC_BEGIN_EVENT = "SUP_REMOVE_SYNC_BEGIN_EVENT"; // Since we sync with server
var SUP_REMOVE_SYNC_ERROR_EVENT = "SUP_REMOVE_SYNC_ERROR_EVENT"; // Since we sync with server
var SUP_REMOVED_EVENT = "SUP_REMOVED_EVENT";

var SUPS_REFRESH_BEGIN_EVENT = "SUPS_REFRESH_BEGIN_EVENT"; // When refreshing completely from server
var SUPS_REFRESH_ERROR_EVENT = "SUPS_REFRESH_ERROR_EVENT"; // When refreshing completely from server
var SUPS_REFRESHED_EVENT = "SUPS_REFRESHED_EVENT"; // When refreshing completely from server

var SUP_SEND_ERROR_EVENT = "SUP_SEND_ERROR_EVENT";
var SUP_SENT_EVENT = "SUP_SENT_EVENT";

var SUPS_SEND_BEGIN_EVENT = "SUPS_SEND_BEGIN_EVENT";
var SUPS_SEND_ERROR_EVENT = "SUPS_SEND_ERROR_EVENT";
var SUPS_SENT_EVENT = "SUPS_SENT_EVENT";

var SUP_POLLING_INTERVAL_MS = 60000;

var Sup = function (sender_id, sup_id, date) {
    this.sender_id = sender_id;
    this.sup_id = sup_id;
    this.date = date;
};
_.extend(Sup.prototype, {
    sendTo: function (user_id, server, onSuccess, onError) {
        server.sendSup(onSuccess, onError, user_id, this.sup_id, this.date);
    }
});

var SupListModel = function (serverModel) {
    this.server = null;

    var that = this;

    var pollServer = null;
    var handleServerSelectEvent = function (server) {
        if (pollServer) {
            clearInterval(pollServer);
        }

        that.server = server;
        that.refreshFromServer(); // Refresh right away
        pollServer = setInterval(function () {
            that.updateFromServer();
        }, SUP_POLLING_INTERVAL_MS);
    };
    serverModel.addListener(handleServerSelectEvent);

    // All sups
    this.sups = [];

    // Callback functions with the signature as described below
    this.listeners = [];
};
_.extend(SupListModel.prototype, {

    sendSupsTo: function (sendToIds) {
        var that = this;

        var sentSuccessfullyToIds = [];
        var errorWhileTryingToSendToIds = [];

        _.each(
            that.listeners,
            function (listener) {
                listener(SUPS_SEND_BEGIN_EVENT, null);
            }
        );

        // Keep track of where we're at in terms of sending sups
        var numProcessedIds = 0;
        var stepAjax = function () {
            numProcessedIds++;

            if (numProcessedIds == sendToIds.length) {
                if (errorWhileTryingToSendToIds.length > 0) {
                    _.each(
                        that.listeners,
                        function (listener) {
                            listener(SUPS_SEND_ERROR_EVENT, {errorWhileTryingToSendToIds: errorWhileTryingToSendToIds});
                        }
                    );
                } else {
                    _.each(
                        that.listeners,
                        function (listener) {
                            listener(SUPS_SENT_EVENT, {sentSuccessfullyToIds: sentSuccessfullyToIds});
                        }
                    );
                }
            }
        };

        // Send the Sups
        _.each(
            sendToIds,
            function (id) {
                var sup = new Sup(getLoggedInUserIdFromCookie(), generateSupId(), (new Date).getTime());
                sup.syncToServer = true; // Are we syncing to server or not? (Helpful for event listeners)
                sup.sendToId = id;

                var onSuccess = function (protocol_version, error, command, message_id, reply_data) {
                    sentSuccessfullyToIds.push(id);

                    _.each(
                        that.listeners,
                        function (listener) {
                            listener(SUP_SENT_EVENT, sup);
                        }
                    );

                    stepAjax();
                };

                var onError = function (protocol_version, error, command, message_id, reply_data) {
                    errorWhileTryingToSendToIds.push(id);

                    _.each(
                        that.listeners,
                        function (listener) {
                            listener(SUP_SEND_ERROR_EVENT, sup);
                        }
                    );

                    stepAjax();
                };

                sup.sendTo(id, that.server, onSuccess, onError);
            }
        );
    },

    addListener: function (listener) {
        this.listeners.push(listener);
    },

    removeListener: function (listener) {
        this.listeners = _.without(this.listeners, listener);
    },

    supExistsWithId: function (sup_id) {
        return _.findWhere(this.sups, {'sup_id': sup_id}) ? true : false;
    },

    addSup: function (sup, syncToServer) {
        syncToServer = typeof syncToServer !== 'undefined' ? syncToServer : false;

        if (typeof sup.sender_id === 'undefined') return;
        if (typeof sup.sup_id === 'undefined') return;
        if (typeof sup.date === 'undefined') return;

        if (this.supExistsWithId(sup.sup_id)) return; // Sup already in list

        var that = this;

        sup.syncToServer = syncToServer; // Are we syncing to server or not? (Helpful for event listeners)

        that.sups.push(sup);
        _.each(
            that.listeners,
            function (listener) {
                listener(SUP_ADDED_EVENT, sup);
            }
        );
    },

    updateFromServer: function () {
        var that = this;

        // Ajax stuff
        var onSuccess = function (protocol_version, error, command, message_id, reply_data) {
            var kvpList = reply_data;
            _.each(
                kvpList,
                function (kvp) {
                    var newSup = new Sup(kvp.sender_id, kvp.sup_id, kvp.date);
                    that.addSup(newSup, true);
                }
            );
        };
        var onError = function (protocol_version, error, command, message_id, reply_data) {
        };
        this.server.getSups(onSuccess, onError);
    },

    refreshFromServer: function () {
        var that = this;

        // Start refreshing from server
        _.each(
            this.listeners,
            function (listener) {
                listener(SUPS_REFRESH_BEGIN_EVENT, {syncToServer: false});
            }
        );

        // Remove all Sups locally
        this.removeAllSups(false);

        // Local changes upon success
        var refreshFinishedWithoutError = function () {
            _.each(
                that.listeners,
                function (listener) {
                    listener(SUPS_REFRESHED_EVENT, {syncToServer: false});
                }
            );
        };

        // Do this if there was an error while trying to refresh
        var refreshFinishedWithError = function (serverError) {
            _.each(
                that.listeners,
                function (listener) {
                    listener(SUPS_REFRESH_ERROR_EVENT, {syncToServer: false, serverError: serverError});
                }
            );
        };

        // Ajax stuff
        var onSuccess = function (protocol_version, error, command, message_id, reply_data) {
            var kvpList = reply_data;
            _.each(
                kvpList,
                function (kvp) {
                    var newSup = new Sup(kvp.sender_id, kvp.sup_id, kvp.date);
                    that.addSup(newSup);
                }
            );

            refreshFinishedWithoutError();
        };
        var onError = function (protocol_version, error, command, message_id, reply_data) {
            refreshFinishedWithError(error);
        };
        this.server.getSups(onSuccess, onError);
    },

    removeSup: function (sup, syncToServer) {
        syncToServer = typeof syncToServer !== 'undefined' ? syncToServer : true;

        if (!this.supExistsWithId(sup.sup_id)) return; // Sup not in list

        var that = this;

        sup.syncToServer = syncToServer; // Are we syncing to server or not? (Helpful for event listeners)

        // Local changes upon success
        var syncFinishedWithoutError = function () {
            that.sups = _.without(that.sups, _.findWhere(that.sups, {sup_id: sup.sup_id}));

            _.each(
                that.listeners,
                function (listener) {
                    listener(SUP_REMOVED_EVENT, sup);
                }
            );
        };

        // No syncing, so it's all local changes
        if (!syncToServer) {
            syncFinishedWithoutError();
            return;
        }

        // Start syncing with server
        _.each(
            this.listeners,
            function (listener) {
                listener(SUP_REMOVE_SYNC_BEGIN_EVENT, sup);
            }
        );

        // Do this if there was an error while trying to sync
        var syncFinishedWithError = function (serverError) {
            sup.serverError = serverError;
            _.each(
                that.listeners,
                function (listener) {
                    listener(SUP_REMOVE_SYNC_ERROR_EVENT, sup);
                }
            );
        };

        // Ajax stuff
        var onSuccess = function (protocol_version, error, command, message_id, reply_data) {
            syncFinishedWithoutError();
        };
        var onError = function (protocol_version, error, command, message_id, reply_data) {
            syncFinishedWithError(error);
        };
        this.server.removeSup(onSuccess, onError, sup.sup_id);
    },

    removeAllSups: function (syncToServer) {
        syncToServer = typeof syncToServer !== 'undefined' ? syncToServer : true;

        var that = this;

        _.each(
            this.sups,
            function (sup) {
                that.removeSup(sup, syncToServer);
            }
        );
    },

    getSups: function () {
        return this.sups;
    },

    totalSups: function () {
        return this.sups.length;
    },

    locationFromBack: function (sup) {
        if (!this.supExistsWithId(sup.sup_id)) return -1; // Sup not in list

        var location = 1;

        for (var i = this.totalSups() - 1; i >= 0; i--) {
            var s = this.sups[i];
            if (sup.sup_id == s.sup_id) {
                return location;
            }

            location++;
        }

        return -1; // Not found
    }
});
