// @flow

import React from 'react';

import AbstractStatelessP5Canvas, { type Props as AbstractProps } from '../AbstractStatelessP5Canvas';

type Props = AbstractProps & {

    /**
     * External class name passed through props.
     */
    className?: string,

    /**
     * ID of the component to be rendered.
     */
    id?: string,

    /**
     * TestId of the element, if any.
     */
    testId?: string
};

/**
 * Implements a stateless P5Canvas component that renders a P5Canvas for this video purely from what gets passed through
 * props.
 */
export default class StatelessP5Canvas extends AbstractStatelessP5Canvas<Props> {
    /**
     * Implements {@code Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const { initials, url } = this.props;

            return (
                <div
                    className = { `${this._getP5CanvasClassName()}` }
                    data-testid = { this.props.testId }
                    id = { this.props.id }
                    style = { this._getP5CanvasStyle(this.props.color) }>
                </div>
            );
    }

    /**
     * Constructs a style object to be used on the p5Canvas.
     *
     * @param {string?} color - The desired background color.
     * @returns {Object}
     */
    _getP5CanvasStyle(color) {
        const { size } = this.props;

        return {
            backgroundColor: color || undefined,
            fontSize: size ? size * 0.5 : '180%',
            height: size || '100%',
            width: size || '100%'
        };
    }

    /**
     * Constructs a list of class names required for the avatar component.
     *
     * @param {string} additional - Any additional class to add.
     * @returns {string}
     */
    _getP5CanvasClassName(additional) {
        return `p5Canvas ${additional || ''} ${this.props.className || ''}`;
    }
}
