/*globals define, WebGMEGlobal*/
/*jshint browser: true*/
/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Wed Nov 30 2016 10:36:41 GMT-0600 (Central Standard Time).
 */

define([
    'js/Constants',
    './PluginEvaluator'
], function (CONSTANTS, PluginEvaluator) {

    'use strict';

    var SCRIPT_CODE_ATTR_NAME = 'scriptCode';

    /**
     * @param {object} options
     * @class
     * @augments {PluginEvaluator}
     * @constructor
     */
    function ICoreControl(options) {
        PluginEvaluator.call(this);
        this._logger = options.logger.fork('Control');

        this._client = options.client;

        // Initialize core collections and variables
        this._widget = options.widget;
        this._currentNodeId = null;

        this._logger.debug('ctor finished');
    }

    // Prototypical inheritance from PluginEvaluator.
    ICoreControl.prototype = Object.create(PluginEvaluator.prototype);
    ICoreControl.prototype.constructor = ICoreControl;

    /* * * * * * * * Visualizer content update callbacks * * * * * * * */
    // One major concept here is with managing the territory. The territory
    // defines the parts of the project that the visualizer is interested in
    // (this allows the browser to then only load those relevant parts).
    ICoreControl.prototype.selectedObjectChanged = function (nodeId) {
        var desc = this._getObjectDescriptor(nodeId),
            self = this;

        self._logger.debug('activeObject nodeId \'' + nodeId + '\'');

        // Remove current territory patterns
        if (self._currentNodeId) {
            self._client.removeUI(self._territoryId);
        }

        self._currentNodeId = nodeId;

        if (typeof self._currentNodeId === 'string') {
            // Put new node's info into territory rules
            self._selfPatterns = {};
            self._selfPatterns[nodeId] = {children: 0};  // Territory "rule"

            self._territoryId = self._client.addUI(self, function (events) {
                self._eventCallback(events);
            });

            // Update the territory
            self._client.updateTerritory(self._territoryId, self._selfPatterns);
        }
    };

    // This next function retrieves the relevant node information for the widget
    ICoreControl.prototype._getObjectDescriptor = function (nodeId) {
        var node = this._client.getNode(nodeId),
            objDescriptor;

        if (node) {
            objDescriptor = {
                id: node.getId(),
                name: node.getAttribute('name'),
                scriptCode: node.getAttribute(SCRIPT_CODE_ATTR_NAME)
            };
        }

        return objDescriptor;
    };

    /* * * * * * * * Node Event Handling * * * * * * * */
    ICoreControl.prototype._eventCallback = function (events) {
        var i = events ? events.length : 0,
            event;

        this._logger.debug('_eventCallback \'' + i + '\' items');

        while (i--) {
            event = events[i];
            switch (event.etype) {

                case CONSTANTS.TERRITORY_EVENT_LOAD:
                    this._onLoad(event.eid);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UPDATE:
                    this._onUpdate(event.eid);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UNLOAD:
                    this._onUnload(event.eid);
                    break;
                default:
                    break;
            }
        }

        this._logger.debug('_eventCallback \'' + events.length + '\' items - DONE');
    };

    ICoreControl.prototype._onLoad = function (gmeId) {
        var description = this._getObjectDescriptor(gmeId);
        this._widget.addNode(description);
    };

    ICoreControl.prototype._onUpdate = function (gmeId) {
        var description = this._getObjectDescriptor(gmeId);
        this._widget.updateNode(description);
    };

    ICoreControl.prototype._onUnload = function (gmeId) {
        this._widget.removeNode(gmeId);
    };

    ICoreControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        if (this._currentNodeId === activeObjectId) {
            // The same node selected as before - do not trigger
        } else {
            this.selectedObjectChanged(activeObjectId);
        }
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    ICoreControl.prototype.destroy = function () {
        this._detachClientEventListeners();
        this._removeToolbarItems();
    };

    ICoreControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
    };

    ICoreControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
    };

    ICoreControl.prototype.onActivate = function () {
        this._attachClientEventListeners();
        this._displayToolbarItems();

        if (typeof this._currentNodeId === 'string') {
            WebGMEGlobal.State.registerSuppressVisualizerFromNode(true);
            WebGMEGlobal.State.registerActiveObject(this._currentNodeId);
            WebGMEGlobal.State.registerSuppressVisualizerFromNode(false);
        }
    };

    ICoreControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
        this._hideToolbarItems();
    };

    /* * * * * * * * * * Updating the toolbar * * * * * * * * * */
    ICoreControl.prototype._displayToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].show();
            }
        } else {
            this._initializeToolbar();
        }
    };

    ICoreControl.prototype._hideToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].hide();
            }
        }
    };

    ICoreControl.prototype._removeToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].destroy();
            }
        }
    };

    ICoreControl.prototype._initializeToolbar = function () {
        var self = this,
            toolBar = WebGMEGlobal.Toolbar;

        this._toolbarItems = [];

        this._toolbarItems.push(toolBar.addSeparator());

        this.$btnSettings = toolBar.addButton({
            title: 'ICore Settings',
            icon: 'glyphicon glyphicon-cog',
            clickFn: function (/*data*/) {
                console.log('settings');
            }
        });

        this._toolbarItems.push(this.$btnSettings);

        this.$btnSave = toolBar.addButton({
            title: 'Save Code',
            icon: 'glyphicon glyphicon-floppy-disk',
            clickFn: function (/*data*/) {
                if (typeof self._currentNodeId === 'string') {
                    self._client.setAttribute(self._currentNodeId, SCRIPT_CODE_ATTR_NAME, self._widget.getCode(),
                        'ICoreControl updated [' + self._currentNodeId + '] attribute' + SCRIPT_CODE_ATTR_NAME +
                        ' with new value.');
                }
            }
        });

        this._toolbarItems.push(this.$btnSave);

        this.$btnExecute = toolBar.addButton({
            title: 'Execute code',
            icon: 'glyphicon glyphicon-play-circle',
            clickFn: function (/*data*/) {
                self.evaluateCode(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });

        this._toolbarItems.push(this.$btnExecute);

        this._toolbarInitialized = true;
    };

    return ICoreControl;
});