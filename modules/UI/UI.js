/* global APP, $, config, interfaceConfig */


const UI = {};

import EventEmitter from 'events';
import Logger from 'jitsi-meet-logger';

import { getLocalParticipant } from '../../react/features/base/participants';
import { toggleChat } from '../../react/features/chat';
import { setDocumentUrl } from '../../react/features/etherpad';
import { setFilmstripVisible } from '../../react/features/filmstrip';
import { joinLeaveNotificationsDisabled, setNotificationsEnabled } from '../../react/features/notifications';
import {
    dockToolbox,
    setToolboxEnabled,
    showToolbox
} from '../../react/features/toolbox';
import UIEvents from '../../service/UI/UIEvents';

import EtherpadManager from './etherpad/Etherpad';
import SharedVideoManager from './shared_video/SharedVideo';
import messageHandler from './util/MessageHandler';
import UIUtil from './util/UIUtil';
import VideoLayout from './videolayout/VideoLayout';

const logger = Logger.getLogger(__filename);

UI.messageHandler = messageHandler;

const eventEmitter = new EventEmitter();

UI.eventEmitter = eventEmitter;

let etherpadManager;
let sharedVideoManager;

const UIListeners = new Map([
    [
        UIEvents.ETHERPAD_CLICKED,
        () => etherpadManager && etherpadManager.toggleEtherpad()
    ], [
        UIEvents.SHARED_VIDEO_CLICKED,
        () => sharedVideoManager && sharedVideoManager.toggleSharedVideo()
    ], [
        UIEvents.TOGGLE_FILMSTRIP,
        () => UI.toggleFilmstrip()
    ]
]);

/**
 * Indicates if we're currently in full screen mode.
 *
 * @return {boolean} {true} to indicate that we're currently in full screen
 * mode, {false} otherwise
 */
UI.isFullScreen = function() {
    //console.log("45 ");
    return UIUtil.isFullScreen();
};

/**
 * Returns true if the etherpad window is currently visible.
 * @returns {Boolean} - true if the etherpad window is currently visible.
 */
UI.isEtherpadVisible = function() {
    //console.log("44.");
    return Boolean(etherpadManager && etherpadManager.isVisible());
};

/**
 * Returns true if there is a shared video which is being shown (?).
 * @returns {boolean} - true if there is a shared video which is being shown.
 */
UI.isSharedVideoShown = function() {
    //console.log("43.");
    return Boolean(sharedVideoManager && sharedVideoManager.isSharedVideoShown);
};

/**
 * Notify user that server has shut down.
 */
UI.notifyGracefulShutdown = function() {
    messageHandler.showError({
        descriptionKey: 'dialog.gracefulShutdown',
        titleKey: 'dialog.serviceUnavailable'
    });

    //console.log("42.");
};

/**
 * Notify user that reservation error happened.
 */
UI.notifyReservationError = function(code, msg) {
    messageHandler.showError({
        descriptionArguments: {
            code,
            msg
        },
        descriptionKey: 'dialog.reservationErrorMsg',
        titleKey: 'dialog.reservationError'
    });

    //console.log("41.");
};

/**
 * Change nickname for the user.
 * @param {string} id user id
 * @param {string} displayName new nickname
 */
UI.changeDisplayName = function(id, displayName) {
    VideoLayout.onDisplayNameChanged(id, displayName);
    //console.log("40.");
};

/**
 * Initialize conference UI.
 */
UI.initConference = function() {
    const { getState } = APP.store;
    const { id, name } = getLocalParticipant(getState);

    UI.showToolbar();

    const displayName = config.displayJids ? id : name;

    if (displayName) {
        UI.changeDisplayName('localVideoContainer', displayName);
    }
    //console.log("start!!..");
    //alert("start!!..");
    
};

/**
 * Returns the shared document manager object.
 * @return {EtherpadManager} the shared document manager object
 */
UI.getSharedVideoManager = function() {
    //console.log("1.");
    return sharedVideoManager;
};

/**
 * Starts the UI module and initializes all related components.
 *
 * @returns {boolean} true if the UI is ready and the conference should be
 * established, false - otherwise (for example in the case of welcome page)
 */
UI.start = function() {
    
    // Set the defaults for prompt dialogs.
    $.prompt.setDefaults({ persistent: false });

    VideoLayout.init(eventEmitter);
    if (!interfaceConfig.filmStripOnly) {
        VideoLayout.initLargeVideo();
    }

    // Do not animate the video area on UI start (second argument passed into
    // resizeVideoArea) because the animation is not visible anyway. Plus with
    // the current dom layout, the quality label is part of the video layout and
    // will be seen animating in.
    VideoLayout.resizeVideoArea();

    sharedVideoManager = new SharedVideoManager(eventEmitter);

    if (interfaceConfig.filmStripOnly) {
        $('body').addClass('filmstrip-only');
        APP.store.dispatch(setNotificationsEnabled(false));
    } else if (config.iAmRecorder) {
        // in case of iAmSipGateway keep local video visible
        if (!config.iAmSipGateway) {
            VideoLayout.setLocalVideoVisible(false);
            APP.store.dispatch(setNotificationsEnabled(false));
        }

        APP.store.dispatch(setToolboxEnabled(false));
        UI.messageHandler.enablePopups(false);
    }
    ////console.log("2.");
};

/**
 * Setup some UI event listeners.
 */
UI.registerListeners
    = () => UIListeners.forEach((value, key) => UI.addListener(key, value));

/**
 * Setup some DOM event listeners.
 */
UI.bindEvents = () => {
    /**
     *
     */
    function onResize() {
        VideoLayout.onResize();
    }

    // Resize and reposition videos in full screen mode.
    $(document).on(
            'webkitfullscreenchange mozfullscreenchange fullscreenchange',
            onResize);

    $(window).resize(onResize);

    //console.log("3.");
};

/**
 * Unbind some DOM event listeners.
 */
UI.unbindEvents = () => {
    $(document).off(
            'webkitfullscreenchange mozfullscreenchange fullscreenchange');

    $(window).off('resize');
    //console.log(".4");
};

/**
 * Show local video stream on UI.
 * @param {JitsiTrack} track stream to show
 */
UI.addLocalVideoStream = track => {
    VideoLayout.changeLocalVideo(track);
    //console.log("5");
};

/**
 * Setup and show Etherpad.
 * @param {string} name etherpad id
 */
UI.initEtherpad = name => {
    if (etherpadManager || !config.etherpad_base || !name) {
        return;
    }
    logger.log('Etherpad is enabled');

    etherpadManager = new EtherpadManager(eventEmitter);

    const url = new URL(name, config.etherpad_base);

    APP.store.dispatch(setDocumentUrl(url.toString()));
    //console.log("6.");
};

/**
 * Returns the shared document manager object.
 * @return {EtherpadManager} the shared document manager object
 */
UI.getSharedDocumentManager = () => etherpadManager;

/**
 * Show user on UI.
 * @param {JitsiParticipant} user
 */
UI.addUser = function(user) {
    const id = user.getId();
    const displayName = user.getDisplayName();
    const status = user.getStatus();

    if (status) {
        // FIXME: move updateUserStatus in participantPresenceChanged action
        UI.updateUserStatus(user, status);
    }

    // set initial display name
    if (displayName) {
        UI.changeDisplayName(id, displayName);
    }
    //console.log("7.");
};

/**
 * Update videotype for specified user.
 * @param {string} id user id
 * @param {string} newVideoType new videotype
 */
UI.onPeerVideoTypeChanged
    = (id, newVideoType) => VideoLayout.onVideoTypeChanged(id, newVideoType);

/**
 * Updates the user status.
 *
 * @param {JitsiParticipant} user - The user which status we need to update.
 * @param {string} status - The new status.
 */
UI.updateUserStatus = (user, status) => {
    const reduxState = APP.store.getState() || {};
    const { calleeInfoVisible } = reduxState['features/invite'] || {};

    // We hide status updates when join/leave notifications are disabled,
    // as jigasi is the component with statuses and they are seen as join/leave notifications.
    if (!status || calleeInfoVisible || joinLeaveNotificationsDisabled()) {
        return;
    }

    const displayName = user.getDisplayName();

    messageHandler.participantNotification(
        displayName,
        '',
        'connected',
        'dialOut.statusMessage',
        { status: UIUtil.escapeHtml(status) });

        //console.log("8.");
};

/**
 * Toggles filmstrip.
 */
UI.toggleFilmstrip = function() {
    const { visible } = APP.store.getState()['features/filmstrip'];

    APP.store.dispatch(setFilmstripVisible(!visible));

    //console.log("9.");
};

/**
 * Toggles the visibility of the chat panel.
 */
UI.toggleChat = () => APP.store.dispatch(toggleChat());

/**
 * Handle new user display name.
 */
UI.inputDisplayNameHandler = function(newDisplayName) {
    eventEmitter.emit(UIEvents.NICKNAME_CHANGED, newDisplayName);
    //console.log("10.");
};

// FIXME check if someone user this
UI.showLoginPopup = function(callback) {
    logger.log('password is required');

    const message
        = `<input name="username" type="text"
                placeholder="user@domain.net"
                class="input-control" autofocus>
         <input name="password" type="password"
                data-i18n="[placeholder]dialog.userPassword"
                class="input-control"
                placeholder="user password">`

    ;

    // eslint-disable-next-line max-params
    const submitFunction = (e, v, m, f) => {
        if (v && f.username && f.password) {
            callback(f.username, f.password);
        }
    };

    messageHandler.openTwoButtonDialog({
        titleKey: 'dialog.passwordRequired',
        msgString: message,
        leftButtonKey: 'dialog.Ok',
        submitFunction,
        focus: ':input:first'
    });

    //console.log("11");
};

UI.askForNickname = function() {
    // eslint-disable-next-line no-//console.log
    return window.prompt('Your nickname (optional)');

    //console.log("12");
};

/**
 * Sets muted audio state for participant
 */
UI.setAudioMuted = function(id, muted) {
    VideoLayout.onAudioMute(id, muted);
    if (APP.conference.isLocalId(id)) {
        APP.conference.updateAudioIconEnabled();
    }
    //console.log("13.");
};

/**
 * Sets muted video state for participant
 */
UI.setVideoMuted = function(id, muted) {
    VideoLayout.onVideoMute(id, muted);
    if (APP.conference.isLocalId(id)) {
        APP.conference.updateVideoIconEnabled();
    }
    //console.log("14.");
};

/**
 * Triggers an update of remote video and large video displays so they may pick
 * up any state changes that have occurred elsewhere.
 *
 * @returns {void}
 */
UI.updateAllVideos = () => VideoLayout.updateAllVideos();

/**
 * Adds a listener that would be notified on the given type of event.
 *
 * @param type the type of the event we're listening for
 * @param listener a function that would be called when notified
 */
UI.addListener = function(type, listener) {
    eventEmitter.on(type, listener);
    //console.log("15.");
};

/**
 * Removes the all listeners for all events.
 *
 * @returns {void}
 */
UI.removeAllListeners = function() {
    eventEmitter.removeAllListeners();
    //console.log("16.");
};

/**
 * Removes the given listener for the given type of event.
 *
 * @param type the type of the event we're listening for
 * @param listener the listener we want to remove
 */
UI.removeListener = function(type, listener) {
    eventEmitter.removeListener(type, listener);
    //console.log("17.");
};

/**
 * Emits the event of given type by specifying the parameters in options.
 *
 * @param type the type of the event we're emitting
 * @param options the parameters for the event
 */
UI.emitEvent = (type, ...options) => eventEmitter.emit(type, ...options);

UI.clickOnVideo = videoNumber => VideoLayout.togglePin(videoNumber);

// Used by torture.
UI.showToolbar = timeout => APP.store.dispatch(showToolbox(timeout));

// Used by torture.
UI.dockToolbar = dock => APP.store.dispatch(dockToolbox(dock));

/**
 * Updates the displayed avatar for participant.
 *
 * @param {string} id - User id whose avatar should be updated.
 * @param {string} avatarURL - The URL to avatar image to display.
 * @returns {void}
 */
UI.refreshAvatarDisplay = function(id) {
    VideoLayout.changeUserAvatar(id);
    //console.log("18..");
};

/**
 * Notify user that connection failed.
 * @param {string} stropheErrorMsg raw Strophe error message
 */
UI.notifyConnectionFailed = function(stropheErrorMsg) {
    let descriptionKey;
    let descriptionArguments;

    if (stropheErrorMsg) {
        descriptionKey = 'dialog.connectErrorWithMsg';
        descriptionArguments = { msg: stropheErrorMsg };
    } else {
        descriptionKey = 'dialog.connectError';
    }

    messageHandler.showError({
        descriptionArguments,
        descriptionKey,
        titleKey: 'connection.CONNFAIL'
    });

    //console.log("19.");
};


/**
 * Notify user that maximum users limit has been reached.
 */
UI.notifyMaxUsersLimitReached = function() {
    messageHandler.showError({
        hideErrorSupportLink: true,
        descriptionKey: 'dialog.maxUsersLimitReached',
        titleKey: 'dialog.maxUsersLimitReachedTitle'
    });

    //console.log("20.");
};

/**
 * Notify user that he was automatically muted when joned the conference.
 */
UI.notifyInitiallyMuted = function() {
    messageHandler.participantNotification(
        null,
        'notify.mutedTitle',
        'connected',
        'notify.muted',
        null);

        //console.log("21.");
};

UI.handleLastNEndpoints = function(leavingIds, enteringIds) {
    VideoLayout.onLastNEndpointsChanged(leavingIds, enteringIds);

    //console.log("22.");
};

/**
 * Update audio level visualization for specified user.
 * @param {string} id user id
 * @param {number} lvl audio level
 */
UI.setAudioLevel = (id, lvl) => VideoLayout.setAudioLevel(id, lvl);

/**
 * Hide connection quality statistics from UI.
 */
UI.hideStats = function() {
    VideoLayout.hideStats();

    //console.log("23.");
};


UI.notifyTokenAuthFailed = function() {
    messageHandler.showError({
        descriptionKey: 'dialog.tokenAuthFailed',
        titleKey: 'dialog.tokenAuthFailedTitle'
    });
    
    //console.log("24.");
};

UI.notifyInternalError = function(error) {
    messageHandler.showError({
        descriptionArguments: { error },
        descriptionKey: 'dialog.internalError',
        titleKey: 'dialog.internalErrorTitle'
    });

    //console.log("25.");
};

UI.notifyFocusDisconnected = function(focus, retrySec) {
    messageHandler.participantNotification(
        null, 'notify.focus',
        'disconnected', 'notify.focusFail',
        { component: focus,
            ms: retrySec }
    );

    //console.log("26.");
};

/**
 * Notifies interested listeners that the raise hand property has changed.
 *
 * @param {boolean} isRaisedHand indicates the current state of the
 * "raised hand"
 */
UI.onLocalRaiseHandChanged = function(isRaisedHand) {
    eventEmitter.emit(UIEvents.LOCAL_RAISE_HAND_CHANGED, isRaisedHand);

    //console.log("27.");
};

/**
 * Update list of available physical devices.
 */
UI.onAvailableDevicesChanged = function() {
    APP.conference.updateAudioIconEnabled();
    APP.conference.updateVideoIconEnabled();

    //console.log("28.");
};

/**
 * Returns the id of the current video shown on large.
 * Currently used by tests (torture).
 */
UI.getLargeVideoID = function() {
    //console.log("29.");
    return VideoLayout.getLargeVideoID();
};

/**
 * Returns the current video shown on large.
 * Currently used by tests (torture).
 */
UI.getLargeVideo = function() {
    //console.log("30.");
    return VideoLayout.getLargeVideo();
};

/**
 * Show shared video.
 * @param {string} id the id of the sender of the command
 * @param {string} url video url
 * @param {string} attributes
*/
UI.onSharedVideoStart = function(id, url, attributes) {

    //console.log("31.");
    if (sharedVideoManager) {
        sharedVideoManager.onSharedVideoStart(id, url, attributes);
    }
};

/**
 * Update shared video.
 * @param {string} id the id of the sender of the command
 * @param {string} url video url
 * @param {string} attributes
 */
UI.onSharedVideoUpdate = function(id, url, attributes) {
    //console.log("32.");
    if (sharedVideoManager) {
        sharedVideoManager.onSharedVideoUpdate(id, url, attributes);
    }
};

/**
 * Stop showing shared video.
 * @param {string} id the id of the sender of the command
 * @param {string} attributes
 */
UI.onSharedVideoStop = function(id, attributes) {
    //console.log("33.");
    if (sharedVideoManager) {
        sharedVideoManager.onSharedVideoStop(id, attributes);
    }
};

/**
 * Handles user's features changes.
 */
UI.onUserFeaturesChanged = user => VideoLayout.onUserFeaturesChanged(user);

/**
 * Returns the number of known remote videos.
 *
 * @returns {number} The number of remote videos.
 */
UI.getRemoteVideosCount = () => VideoLayout.getRemoteVideosCount();

/**
 * Sets the remote control active status for a remote participant.
 *
 * @param {string} participantID - The id of the remote participant.
 * @param {boolean} isActive - The new remote control active status.
 * @returns {void}
 */
UI.setRemoteControlActiveStatus = function(participantID, isActive) {
    VideoLayout.setRemoteControlActiveStatus(participantID, isActive);
    //console.log("34.");
};

/**
 * Sets the remote control active status for the local participant.
 *
 * @returns {void}
 */
UI.setLocalRemoteControlActiveChanged = function() {
    VideoLayout.setLocalRemoteControlActiveChanged();
    //console.log("35.");
};

// TODO: Export every function separately. For now there is no point of doing
// this because we are importing everything.
export default UI;
