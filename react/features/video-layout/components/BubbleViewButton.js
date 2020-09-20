// @flow

import type { Dispatch } from 'redux';

import {
    createToolbarEvent,
    sendAnalytics
} from '../../analytics';
import { BUBBLE_VIEW_ENABLED, getFeatureFlag } from '../../base/flags';
import { translate } from '../../base/i18n';
import { IconBubbleView } from '../../base/icons';
import { getParticipantCount } from '../../base/participants';
import { connect } from '../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../base/toolbox/components';
import { setBubbleView } from '../actions';
import { setTileView } from '../actions';
import { shouldDisplayBubbleView } from '../functions';
import logger from '../logger';

/**
 * The type of the React {@code Component} props of {@link BubbleViewButton}.
 */
type Props = AbstractButtonProps & {

    /**
     * Whether or not bubble view layout has been enabled as the user preference.
     */
    _bubbleViewEnabled: boolean,

    /**
     * Used to dispatch actions from the buttons.
     */
    dispatch: Dispatch<any>
};

/**
 * Component that renders a toolbar button for toggling the bubble layout view.
 *
 * @extends AbstractButton
 */
class BubbleViewButton<P: Props> extends AbstractButton<P, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.bubbleView';
    icon = IconBubbleView;
    label = 'toolbar.enterBubbleView';
    toggledLabel = 'toolbar.exitBubbleView';
    tooltip = 'toolbar.bubbleViewToggle';

    /**
     * Handles clicking / pressing the button.
     *
     * @override
     * @protected
     * @returns {void}
     */
    _handleClick() {
        const { _bubbleViewEnabled, dispatch } = this.props;

        sendAnalytics(createToolbarEvent(
            'bubbleview.button',
            {
                'is_enabled': _bubbleViewEnabled
            }));
        const value = !_bubbleViewEnabled;

        logger.debug(`Bubble view ${value ? 'enable' : 'disable'}`);
        dispatch(setBubbleView(value));
        dispatch(setTileView(false));
    }

    /**
     * Indicates whether this button is in toggled state or not.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    _isToggled() {
        return this.props._bubbleViewEnabled;
    }
}

/**
 * Maps (parts of) the redux state to the associated props for the
 * {@code BubbleViewButton} component.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The properties explicitly passed to the component instance.
 * @returns {Props}
 */
function _mapStateToProps(state, ownProps) {
    const enabled = getFeatureFlag(state, BUBBLE_VIEW_ENABLED, true);
    const lonelyMeeting = getParticipantCount(state) < 2;
    const { visible = enabled && !lonelyMeeting } = ownProps;

    return {
        _bubbleViewEnabled: shouldDisplayBubbleView(state),
        visible
    };
}

export default translate(connect(_mapStateToProps)(BubbleViewButton));
