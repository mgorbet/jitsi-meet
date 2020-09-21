// @flow

import React, { PureComponent } from 'react';

import { getParticipantById } from '../../participants';
import { connect } from '../../redux';
import { genericP5function } from '../functions';
import VideoLayout from '../../../../../modules/UI/videolayout/VideoLayout';

import { StatelessP5Canvas } from '.';
import p5 from 'p5';

export type Props = {

    /**
     * A prop to maintain compatibility with web.
     */
    className?: string,

    /**
     * ID of the element, if any.
     */
    id?: string,

    /**
     * The ID of the participant
     */
    participantId?: string,

    /**
     * The size of the P5Canvas.
     */
    size: number,

    /**
     * TestId of the element, if any.
     */
    testId?: string,

}

type State = {
    p5CanvasFailed: boolean
}

export const DEFAULT_SIZE = 65;

/**
 * Implements a class to render video-specific p5Canvases in the app.
 */
class P5Canvas extends React.Component {
    /**
     * Instantiates a new {@code Component}.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state = {
            p5CanvasFailed: false
        };

        this._onP5CanvasLoadError = this._onP5CanvasLoadError.bind(this);


        // Generating a React reference for use with P5 -mgg
       // this.p5CanvasRef = React.createRef();
       // console.log("___ p5Canvas constructor for video p5Canvas called with React ref created: " + this.p5CanvasRef);
       console.log("___ p5Canvas constructor called by smallvideo.js, sent values for\n participant id: " + this.props.participantId + "\n id: " + this.props.id + "\n videobubble: " + this.props.videobubble.id);

    }



    /**
     * 
     * Extending React Component so we can use p5 freely, so need render() and componentDidMount()   -mgg
     * 
     */
    componentDidMount() {
        console.log(" ____ Mounted p5Canvas for smallVideo " + this.props.id );
        console.log(" ____ Creating p5 object using 'null' ");

        this.setState();

        // create main P5 sketch bound to small video -mgg
//        this.videoP5 = new p5(this.vp5Sketch, window.document.getElementById(this.p5CanvasRef.current));
        this.videoP5 = new p5(this.vp5Sketch, null);
    }


    /************************************************************************************************************
     *  THIS IS THE P5 SKETCH AREA FOR THE SMALL VIDEO WINDOW   -mgg 
     * 
     */

    vp5Sketch = (p) => {
        let p5C;
        let counter;
        let localVideo = false;
        let parent;
        let vbub = this.props.videobubble;
        let pcanvas;
        let myrect = null;

        p.setup = () => {
            // do p5 setup stuff here for main P5 sketch -mgg

            console.log(" 1. p5 Canvas setup for id: " + this.props.id);

            var tHeight = 400;
            var tWidth = 400;

            if(this.props.videobubble == 'localVideoContainer') localVideo = true;

            console.log(" 1. p5 Canvas setup: id is " + this.props.id + " (local video is " + localVideo + ")");


            // if (typeof thumbnailSize !== 'undefined') {
            //     const { tHeight, tWidth } = thumbnailSize;
            // } else {
            //     const tHeight = 200;
            //     const tWidth = 200;
            // }

             pcanvas = p.createCanvas(tHeight, tWidth);
             p5C = p.createGraphics(tHeight, tWidth);
             p5C.clear();
             //pcanvas.elt.style.border = '5px solid red';
             pcanvas.elt.style.zIndex = '1200';
            counter = 0;
            console.log(" ********  p5Canvas for video SETUP() in p5:  w: "+ p.width + " h: " + p.height);

        }

        p.draw = () => {
            //  do p5 draw stuff here for main P5 sketch -mgg

            if(parent === undefined) {
               console.log(" ... binding parent to " + this.props.id);
               parent = window.document.getElementById(this.props.id);
               pcanvas.parent(parent);
            }
            else {
               if(myrect == null) {
                  myrect = parent.getBoundingClientRect();
               }  
            }

            if(myrect == null) return;
            
            if(p5C) {
                p5C.clear();
                p5C.noFill();
                //p5C.fill(200, 100, 0);
                p5C.stroke(200,100,0);
                p5C.ellipse(p.mouseX, p.mouseY, 40, 40);
                p5C.line(p.mouseX, 0, p.mouseX, 400);
                p5C.line(0, p.mouseY, 400, p.mouseY);
                p.clear();
                p.image(p5C, 0, 0);

                if(vbub != null) {
                    console.log("p5: setting " + vbub.id + " style height and width to " + (p.abs(200-p.mouseX))+"px");
                    vbub.style.width=""+(p.abs(200-p.mouseX))+"px";
                    vbub.style.height=""+(p.abs(200-p.mouseX))+"px";
                }

            } else {
                console.log(" *** We have lost the P5 canvas - it is " + p5C);
            }
             counter++;
            if(counter%50 == 0) {

              //   console.log(" ** smallVideo P5Canvas: x: " + p.mouseX + " y: " +p.mouseY);
              //   console.log(" ** smallVideo P5Canvas: container: " + myid + " x: " + myrect.x + " y: " + myrect.y  );
              //   console.log("id: " + this.props.participantId);
            }
        }

    }

    // ******************************************************************************************************************************

    /**
     * Implements {@code Component#componentDidUpdate}.
     *
     * @inheritdoc
    //  */
    // componentDidUpdate(prevProps: P) {
    //     if (prevProps.url !== this.props.url) {

    //         // URI changed, so we need to try to fetch it again.
    //         // Eslint doesn't like this statement, but based on the React doc, it's safe if it's
    //         // wrapped in a condition: https://reactjs.org/docs/react-component.html#componentdidupdate

    //         // eslint-disable-next-line react/no-did-update-set-state
    //         this.setState({
    //             p5CanvasFailed: false
    //         });
    //     }
    // }

    /**
     * Implements {@code Componenr#render}.
     *
     * @inheritdoc
     */
    render() {
        const {
            className,
            id,
            testId
        } = this.props;
        const { p5CanvasFailed } = this.state;

        const p5CanvasProps = {
            className,
            id,
            onP5CanvasLoadError: undefined,
            testId
        };

        console.log(" 3. render: this.p5CanvasRef is " + this.p5CanvasRef);

        return (
            <StatelessP5Canvas id="smallVideoP5Canvas" className="smallVideoP5Canvas"
            ref={this.p5CanvasRef} 
              { ...p5CanvasProps } />
        );
    }

    _onP5CanvasLoadError: () => void;

    /**
     * Callback to handle the error while initializing the p5 Canvas
     * @returns {void}
     */
    _onP5CanvasLoadError() {
        this.setState({
            p5CanvasFailed: true
        });
    }
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @param {Props} ownProps - The own props of the component.
 * @returns {Props}
 */
export function _mapStateToProps(state: Object, ownProps: Props) {
    //const _participant: ?Object = participantId && getParticipantById(state, participantId);

    return {
       // _participant
    };
}

export default connect(_mapStateToProps)(P5Canvas);
