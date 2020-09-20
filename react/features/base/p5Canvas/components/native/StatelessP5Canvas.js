// @flow

import React from 'react';

import { type StyleType } from '../../../styles';
import AbstractStatelessP5Canvas, { type Props as AbstractProps } from '../AbstractStatelessP5Canvas';

import styles from './styles';


type Props = AbstractProps & {

    /**
     * External style passed to the componant.
     */
    style?: StyleType
};

/**
 * Implements a stateless p5Canvas component that renders a p5Canvas purely from what gets passed through
 * props.
 */
export default class statelessP5Canvas extends AbstractStatelessP5Canvas<Props> {
    /**
     * Implements {@code Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const { size, style} = this.props;

        let p5Canvas;


        p5Canvas = this._renderDefaultP5Canvas();

        return (
                <View
                    style = { [
                        styles.p5CanvasContainer(size),
                        style
                    ] }>
                    { p5Canvas }
                </View>
        );
    }

    
    /**
     * Renders the default avatar.
     *
     * @returns {React$Element<*>}
     */
    _renderDefaultP5Canvas() {
        const { size } = this.props;

        return (
            <Image
                source = { DEFAULT_P5CANVAS }
                style = { [
                    styles.p5CanvasContent(size)
                ] } />
        );
    }

}
