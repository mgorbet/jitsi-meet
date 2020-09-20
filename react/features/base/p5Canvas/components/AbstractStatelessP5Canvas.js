// @flow

import { PureComponent } from 'react';

export type Props = {
    /**
     * Callback to signal the failure of the loading of the URL.
     */
    onP5CanvasLoadError?: Function,

    /**
     * Expected size of the P5Canvas.
     */
    size?: number;

};

/**
 * Implements an abstract stateless P5Canvas component that renders over video, purely from what gets passed through
 * props.
 */
export default class AbstractStatelessP5Canvas<P: Props> extends PureComponent<P> {
    /**
     * Checks 
     *
     * @param {string? | Object?} property - The prop to check.
     * @returns {boolean}
     */
    _isProperty(property: ?string | ?Object): boolean {
        return true;  // does nothing for now
    }
}
