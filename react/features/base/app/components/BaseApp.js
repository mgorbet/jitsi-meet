// @flow

import { jitsiLocalStorage } from '@jitsi/js-utils';
import _ from 'lodash';
import React, { Component, Fragment , ReactDOM} from 'react';
import p5 from 'p5';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { compose, createStore } from 'redux';
import Thunk from 'redux-thunk';

import { i18next } from '../../i18n';
import {
    MiddlewareRegistry,
    PersistenceRegistry,
    ReducerRegistry,
    StateListenerRegistry
} from '../../redux';
import { SoundCollection } from '../../sounds';
import { appWillMount, appWillUnmount } from '../actions';
import logger from '../logger';

declare var APP: Object;

/**
 * The type of the React {@code Component} state of {@link BaseApp}.
 */
type State = {

    /**
     * The {@code Route} rendered by the {@code BaseApp}.
     */
    route: Object,

    /**
     * The redux store used by the {@code BaseApp}.
     */
    store: Object
};

/**
 * Base (abstract) class for main App component.
 *
 * @abstract
 */
export default class BaseApp extends Component<*, State> {
    _init: Promise<*>;

    /**
     * Initializes a new {@code BaseApp} instance.
     *
     * @param {Object} props - The read-only React {@code Component} props with
     * which the new instance is to be initialized.
     */
    constructor(props: Object) {
        super(props);

         console.log("constructor of main BaseApp");
        // Generating a React reference for use with P5 -mgg
        this.mainAppRef = React.createRef();

        this.state = {
            route: {},
            store: undefined
        };
    }

    /**
     * Initializes the app.
     *
     * @inheritdoc
     */
    componentDidMount() {


        console.log(" 2. cDM: this.mainappref has " + this.mainAppRef.current.offsetHeight + ", " + this.mainAppRef.current.offsetWidth);

        // create main P5 sketch bound to baseApp -mgg
        this.appP5 = new p5(this.p5Sketch, this.mainAppRef.current);


        /**
         * Make the mobile {@code BaseApp} wait until the {@code AsyncStorage}
         * implementation of {@code Storage} initializes fully.
         *
         * @private
         * @see {@link #_initStorage}
         * @type {Promise}
         */
        this._init = this._initStorage()
            .catch(err => {
                /* BaseApp should always initialize! */
                logger.error(err);
            })
            .then(() => new Promise(resolve => {
                this.setState({
                    store: this._createStore()
                }, resolve);
            }))
            .then(() => this.state.store.dispatch(appWillMount(this)))
            .catch(err => {
                /* BaseApp should always initialize! */
                logger.error(err);
            });
    }


    /***  THIS IS THE P5 SKETCH AREA FOR THE MAIN APP WINDOW   -mgg ***/

    p5Sketch = (p) => {
        let p5Canvas;
        let counter;

        p.setup = () => {
            // do p5 setup stuff here for main P5 sketch -mgg

            console.log(" 1. p5Setup: this.mainappref is " + this.mainAppRef);


             p.createCanvas(800, 1200);
             p5Canvas = p.createGraphics(800, 1200);
             p5Canvas.clear();

            counter = 0;
            console.log(" ********  SETUP in main p5:  w: "+ p.width + " h: " + p.height);

        }

        p.draw = () => {
            // do p5 draw stuff here for main P5 sketch -mgg
            if(p5Canvas) {
                // p5Canvas.fill(200, 100, 0);
                // p5Canvas.ellipse(p.mouseX, p.mouseY, 40, 40);
                // p.image(p5Canvas, 0, 0);
            } else {
                console.log(" *** We have lost the P5 canvas - it is " + p5Canvas);
            }
            counter++;
            if(counter%50 == 0) {
          //       console.log(" ** P5: x: " + p.mouseX + " y: " +p.mouseY);
            }
        }

    }

    /**
     * De-initializes the app.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.state.store.dispatch(appWillUnmount(this));
    }

    /**
     * Delays this {@code BaseApp}'s startup until the {@code Storage}
     * implementation of {@code localStorage} initializes. While the
     * initialization is instantaneous on Web (with Web Storage API), it is
     * asynchronous on mobile/react-native.
     *
     * @private
     * @returns {Promise}
     */
    _initStorage(): Promise<*> {
        const _initializing = jitsiLocalStorage.getItem('_initializing');

        return _initializing || Promise.resolve();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {

        const { route: { component, props }, store } = this.state;

        if (store) {
            return (
                <I18nextProvider i18n = { i18next }>
                    <Provider store = { store }>
                        <Fragment>
                            { this._createMainElement(component, props) }
                            <SoundCollection />
                            { this._createExtraElement() }
                            { this._renderDialogContainer() }
                        </Fragment>
                    </Provider>
                </I18nextProvider>
            );
        }

        // main app ref is going to return the ref that p5Sketch is bound to as a div.  -mgg
        //console.log(" 3. render: this.mainappref is " + this.mainAppRef);

        return (
              <div id="videoCanvas" className="videoCanvas" ref={this.mainAppRef} />
             // <BaseApp ref={this.mainAppRef} />
        );
    }

    /**
     * Creates an extra {@link ReactElement}s to be added (unconditionaly)
     * alongside the main element.
     *
     * @returns {ReactElement}
     * @abstract
     * @protected
     */
    _createExtraElement() {
        return null;
    }

    /**
     * Creates a {@link ReactElement} from the specified component, the
     * specified props and the props of this {@code AbstractApp} which are
     * suitable for propagation to the children of this {@code Component}.
     *
     * @param {Component} component - The component from which the
     * {@code ReactElement} is to be created.
     * @param {Object} props - The read-only React {@code Component} props with
     * which the {@code ReactElement} is to be initialized.
     * @returns {ReactElement}
     * @protected
     */
    _createMainElement(component, props) {
        return component ? React.createElement(component, props || {}) : null;
    }

    /**
     * Initializes a new redux store instance suitable for use by this
     * {@code AbstractApp}.
     *
     * @private
     * @returns {Store} - A new redux store instance suitable for use by
     * this {@code AbstractApp}.
     */
    _createStore() {
        // Create combined reducer from all reducers in ReducerRegistry.
        const reducer = ReducerRegistry.combineReducers();

        // Apply all registered middleware from the MiddlewareRegistry and
        // additional 3rd party middleware:
        // - Thunk - allows us to dispatch async actions easily. For more info
        // @see https://github.com/gaearon/redux-thunk.
        let middleware = MiddlewareRegistry.applyMiddleware(Thunk);

        // Try to enable Redux DevTools Chrome extension in order to make it
        // available for the purposes of facilitating development.
        let devToolsExtension;

        if (typeof window === 'object'
                && (devToolsExtension = window.devToolsExtension)) {
            middleware = compose(middleware, devToolsExtension());
        }

        const store = createStore(
            reducer, PersistenceRegistry.getPersistedState(), middleware);

        // StateListenerRegistry
        StateListenerRegistry.subscribe(store);

        // This is temporary workaround to be able to dispatch actions from
        // non-reactified parts of the code (conference.js for example).
        // Don't use in the react code!!!
        // FIXME: remove when the reactification is finished!
        if (typeof APP !== 'undefined') {
            APP.store = store;
        }

        return store;
    }

    /**
     * Navigates to a specific Route.
     *
     * @param {Route} route - The Route to which to navigate.
     * @returns {Promise}
     */
    _navigate(route): Promise<*> {
        if (_.isEqual(route, this.state.route)) {
            return Promise.resolve();
        }

        if (route.href) {
            // This navigation requires loading a new URL in the browser.
            window.location.href = route.href;

            return Promise.resolve();
        }

        // XXX React's setState is asynchronous which means that the value of
        // this.state.route above may not even be correct. If the check is
        // performed before setState completes, the app may not navigate to the
        // expected route. In order to mitigate the problem, _navigate was
        // changed to return a Promise.
        return new Promise(resolve => {
            this.setState({ route }, resolve);
        });
    }

    /**
     * Renders the platform specific dialog container.
     *
     * @returns {React$Element}
     */
    _renderDialogContainer: () => React$Element<*>
}
