// @flow

import { StyleSheet } from 'react-native';

import { ColorPalette } from '../../../styles';

const DEFAULT_SIZE = 65;

/**
 * The styles of the feature base/participants.
 */
export default {

    P5CanvasContainer: (size: number = DEFAULT_SIZE) => {
        return {
            alignItems: 'center',
            borderRadius: size / 2,
            height: size,
            justifyContent: 'center',
            overflow: 'hidden',
            width: size
        };
    },

    P5CanvasContent: (size: number = DEFAULT_SIZE) => {
        return {
            height: size,
            width: size
        };
    }
};
