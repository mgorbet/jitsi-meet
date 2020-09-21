// @flow

import React, { Component } from 'react';
import {
    ScrollView,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import type { Dispatch } from 'redux';

import { connect } from '../../../base/redux';
import { ASPECT_RATIO_NARROW } from '../../../base/responsive-ui/constants';
import { setBubbleViewDimensions } from '../../actions.native';

import Thumbnail from './Thumbnail';
import styles from './styles';

/**
 * The type of the React {@link Component} props of {@link BubbleView}.
 */
type Props = {

    /**
     * Application's aspect ratio.
     */
    _aspectRatio: Symbol,

    /**
     * Application's viewport height.
     */
    _height: number,

    /**
     * The participants in the conference.
     */
    _participants: Array<Object>,

    /**
     * Application's viewport height.
     */
    _width: number,

    /**
     * Invoked to update the receiver video quality.
     */
    dispatch: Dispatch<any>,

    /**
     * Callback to invoke when bubble view is tapped.
     */
    onClick: Function
};

/**
 * The margin for each side of the tile view. Taken away from the available
 * height and width for the tile container to display in.
 *
 * @private
 * @type {number}
 */
const MARGIN = 10;

/**
 * The aspect ratio the tiles should display in.
 *
 * @private
 * @type {number}
 */
const BUBBLE_ASPECT_RATIO = 1;

/**
 * Implements a React {@link Component} which displays thumbnails as
 * repositionable bubbles
 *
 * @extends Component
 */
class BubbleView extends Component<Props> {
    /**
     * Implements React's {@link Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._updateReceiverQuality();
    }

    /**
     * Implements React's {@link Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate() {
        this._updateReceiverQuality();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _height, _width, onClick } = this.props;
        const rowElements = this._groupIntoRows(this._renderThumbnails(), this._getColumnCount());

        return (
            <ScrollView
                style = {{
                    ...styles.bubbleView,
                    height: _height,
                    width: _width
                }}>
                <TouchableWithoutFeedback onPress = { onClick }>
                    <View
                        style = {{
                            ...styles.bubbleViewRows //,
                            //minHeight: _height,
                            //minWidth: _width
                        }}>
                        { rowElements }
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        );
    }

    /**
     * Returns how many columns should be displayed for bubble view.
     *
     * @returns {number}
     * @private
     */
    _getColumnCount() {
        const participantCount = this.props._participants.length;

        // For narrow view, tiles should stack on top of each other for a lonely
        // call and a 1:1 call. Otherwise tiles should be grouped into rows of
        // two.
        if (this.props._aspectRatio === ASPECT_RATIO_NARROW) {
            return participantCount >= 3 ? 2 : 1;
        }

        if (participantCount === 4) {
            // In wide view, a four person call should display as a 2x2 grid.
            return 2;
        }

        return Math.min(3, participantCount);
    }

    /**
     * Returns all participants with the local participant at the end.
     *
     * @private
     * @returns {Participant[]}
     */
    _getSortedParticipants() {
        const participants = [];
        let localParticipant;

        for (const participant of this.props._participants) {
            if (participant.local) {
                localParticipant = participant;
            } else {
                participants.push(participant);
            }
        }

        localParticipant && participants.push(localParticipant);

        return participants;
    }

    /**
     * Calculate the starting diameter for the bubbles.
     *
     * @private
     * @returns {Object}
     */
    _getBubbleDimensions() {
        const { _height, _participants, _width } = this.props;
        const columns = this._getColumnCount();
        const participantCount = _participants.length;
        const heightToUse = _height - (MARGIN * 2);
        const widthToUse = _width - (MARGIN * 2);
        let bubbleWidth;

        // If there is going to be at least two rows, ensure that at least two
        // rows display fully on screen.
        if (participantCount / columns > 1) {
            bubbleWidth = Math.min(widthToUse / columns, heightToUse / 2);
        } else {
            bubbleWidth = Math.min(widthToUse / columns, heightToUse);
        }

        return {
            height: bubbleWidth / BUBBLE_ASPECT_RATIO,
            width: bubbleWidth
        };
    }

    /**
     * Splits a list of thumbnails into React Elements with a maximum of
     * {@link rowLength} thumbnails in each.
     *
     * @param {Array} thumbnails - The list of thumbnails that should be split
     * into separate row groupings.
     * @param {number} rowLength - How many thumbnails should be in each row.
     * @private
     * @returns {ReactElement[]}
     */
    _groupIntoRows(thumbnails, rowLength) {
        const rowElements = [];

        for (let i = 0; i < thumbnails.length; i++) {
            if (i % rowLength === 0) {
                const thumbnailsInRow = thumbnails.slice(i, i + rowLength);

                rowElements.push(
                    <View
                        key = { rowElements.length }
                        style = { styles.bubbleViewRow }>
                        { thumbnailsInRow }
                    </View>
                );
            }
        }

        return rowElements;
    }

    /**
     * Creates React Elements to display each participant in a thumbnail. Each
     * bubble will be.
     *
     * @private
     * @returns {ReactElement[]}
     */
    _renderThumbnails() {
        const styleOverrides = {
            aspectRatio: BUBBLE_ASPECT_RATIO,
            flex: 0,
            height: this._getBubbleDimensions().height,
            width: null
        };

        return this._getSortedParticipants()
            .map(participant => (
                <Thumbnail
                    disableTint = { true }
                    key = { participant.id }
                    participant = { participant }
                    renderDisplayName = { true }
                    styleOverrides = { styleOverrides }
                    bubbleView = { true } />));
    }

    /**
     * Sets the receiver video quality based on the dimensions of the thumbnails
     * that are displayed.
     *
     * @private
     * @returns {void}
     */
    _updateReceiverQuality() {
        const { height, width } = this._getBubbleDimensions();

        this.props.dispatch(setBubbleViewDimensions({
            thumbnailSize: {
                height,
                width
            }
        }));
    }
}

/**
 * Maps (parts of) the redux state to the associated {@code bubbleView}'s props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const responsiveUi = state['features/base/responsive-ui'];

    return {
        _aspectRatio: responsiveUi.aspectRatio,
        _height: responsiveUi.clientHeight,
        _participants: state['features/base/participants'],
        _width: responsiveUi.clientWidth
    };
}

export default connect(_mapStateToProps)(BubbleView);
