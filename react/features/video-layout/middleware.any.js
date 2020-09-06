// @flow

import { getCurrentConference } from '../base/conference';
import { PIN_PARTICIPANT, pinParticipant, getPinnedParticipant } from '../base/participants';
import { MiddlewareRegistry, StateListenerRegistry } from '../base/redux';
import { SET_DOCUMENT_EDITING_STATUS } from '../etherpad';

import { SET_TILE_VIEW } from './actionTypes';
import { setTileView } from './actions';
import { SET_BUBBLE_VIEW } from './actionTypes';
import { setBubbleView } from './actions';

import './subscriber';

let previousTileViewEnabled;
let previousBubbleViewEnabled;
/**
 * Middleware which intercepts actions and updates tile view and button view related state.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {

    // Actions that temporarily clear the user preferred state of tile view,
    // then re-set it when needed.
    case PIN_PARTICIPANT: {
        const pinnedParticipant = getPinnedParticipant(store.getState());

        if (pinnedParticipant) {
            _storeTileViewStateAndClear(store);
            _storeBubbleViewStateAndClear(store);
        } else {
            _restoreTileViewState(store);
            _restoreBubbleViewState(store);
        }
        break;
    }
    case SET_DOCUMENT_EDITING_STATUS:
        if (action.editing) {
            _storeTileViewStateAndClear(store);
            _storeBubbleViewStateAndClear(store);
        } else {
            _restoreTileViewState(store);
            _restoreBubbleViewState(store);
        }
        break;

    // Things to update when tile view state changes
    case SET_TILE_VIEW:
        if (action.enabled && getPinnedParticipant(store)) {
            store.dispatch(pinParticipant(null));
        }
    
    // same for bubble view?  maybe more exponential, b/c need to trade off Tile view also; revisit this -mgg    
    case SET_BUBBLE_VIEW:
        if (action.enabled && getPinnedParticipant(store)) {
            store.dispatch(pinParticipant(null));
        }
    }

    return result;
});

/**
 * Set up state change listener to perform maintenance tasks when the conference
 * is left or failed.
 */
StateListenerRegistry.register(
    state => getCurrentConference(state),
    (conference, { dispatch }, previousConference) => {
        if (conference !== previousConference) {
            // conference changed, left or failed...
            // Clear tile view state.
            dispatch(setTileView());
            dispatch(setBubbleView());
        }
    });

/**
 * Restores tile view state, if it wasn't updated since then.
 *
 * @param {Object} store - The Redux Store.
 * @returns {void}
 */
function _restoreTileViewState({ dispatch, getState }) {
    const { tileViewEnabled } = getState()['features/video-layout'];

    if (tileViewEnabled === undefined && previousTileViewEnabled !== undefined) {
        dispatch(setTileView(previousTileViewEnabled));
    }

    previousTileViewEnabled = undefined;
}

/**
 * Stores the current tile view state and clears it.
 *
 * @param {Object} store - The Redux Store.
 * @returns {void}
 */
function _storeTileViewStateAndClear({ dispatch, getState }) {
    const { tileViewEnabled } = getState()['features/video-layout'];

    if (tileViewEnabled !== undefined) {
        previousTileViewEnabled = tileViewEnabled;
        dispatch(setTileView(undefined));
    }
}

/**
 * Restores bubble view state, if it wasn't updated since then.
 *
 * @param {Object} store - The Redux Store.
 * @returns {void}
 */
function _restoreBubbleViewState({ dispatch, getState }) {
    const { bubbleViewEnabled } = getState()['features/video-layout'];

    if (bubbleViewEnabled === undefined && previousBubbleViewEnabled !== undefined) {
        dispatch(setBubbleView(previousBubbleViewEnabled));
    }

    previousBubbleViewEnabled = undefined;
}

/**
 * Stores the current bubble view state and clears it.
 *
 * @param {Object} store - The Redux Store.
 * @returns {void}
 */
function _storeBubbleViewStateAndClear({ dispatch, getState }) {
    const { bubbleViewEnabled } = getState()['features/video-layout'];

    if (bubbleViewEnabled !== undefined) {
        previousBubbleViewEnabled = bubbleViewEnabled;
        dispatch(setBubbleView(undefined));
    }
}
