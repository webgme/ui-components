/*globals define, WebGMEGlobal*/
/*jshint browser: true*/
/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Wed Nov 30 2016 10:36:41 GMT-0600 (Central Standard Time).
 */

define([
    'js/Constants',
    './ICorePluginEvaluator',
    'js/Toolbar/ToolbarDropDownButton',
    'js/Utils/ComponentSettings'
], function (CONSTANTS, ICorePluginEvaluator, ToolbarDropDownButton, ComponentSettings) {

    'use strict';

    /**
     * @param {object} options
     * @class
     * @augments {ICorePluginEvaluator}
     * @constructor
     */
    function ICoreControl(options) {
        ICorePluginEvaluator.call(this);
        var self = this;
        this._logger = options.logger.fork('Control');

        this._client = options.client;
        this._config = options.config;
        this._configId = options.configId;

        // Initialize core collections and variables
        this._widget = options.widget;
        this._widget.saveCode = function () {
            var node,
                editorCode;

            if (typeof self._currentNodeId === 'string' && self._isEditable === true) {
                node = self._client.getNode(self._currentNodeId);
                editorCode = self._widget.getCode();

                if (node && node.getOwnAttribute(self._config.codeEditor.scriptCodeAttribute) !== editorCode) {
                    self._client.setAttribute(
                        self._currentNodeId,
                        self._config.codeEditor.scriptCodeAttribute,
                        self._widget.getCode(),
                        'ICoreControl updated [' + self._currentNodeId + '] attribute' +
                        self._config.codeEditor.scriptCodeAttribute + ' with new value.');
                }
            }

            self._widget._codeEditor.focus();
        };

        this._widget.executeCode = function () {
            self.evaluateCode(function (err) {
                if (err) {
                    self._widget.addConsoleMessage('error', ['Execution failed with error:', err.stack]);
                } else {
                    self._widget.addConsoleMessage('info', ['Execution finished!']);
                }

                self._widget._codeEditor.focus();
            });
        };

        this._currentNodeId = null;
        this._isEditable = true;

        this._logger.debug('ctor finished');
    }

    // Prototypical inheritance from ICorePluginEvaluator.
    ICoreControl.prototype = Object.create(ICorePluginEvaluator.prototype);
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
                scriptCode: node.getAttribute(this._config.codeEditor.scriptCodeAttribute),
                editable: node.isReadOnly() === false
            };

            if (node.getId() !== '') {
                objDescriptor.editable = objDescriptor.editable &&
                    node.isValidAttributeValueOf(this._config.codeEditor.scriptCodeAttribute, '');
            }
        } else {
            objDescriptor = {
                editable: false
            }
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
        this._setEditable(description.editable);
        this._widget.addNode(description);
    };

    ICoreControl.prototype._onUpdate = function (gmeId) {
        var description = this._getObjectDescriptor(gmeId);
        this._setEditable(description.editable);
        this._widget.updateNode(description);
    };

    ICoreControl.prototype._onUnload = function (gmeId) {
        this._widget.removeNode(gmeId);
    };

    ICoreControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        if (this._currentNodeId === activeObjectId) {
            // The same node selected as before - do not trigger
        } else {
            clearTimeout(this._widget._autoSaveTimerId);
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

    ICoreControl.prototype._setEditable = function (editable) {
        this._isEditable = editable;

        this.$btnSave._btn.enabled(editable);
        this.$btnAutoSave._btn.enabled(editable);
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

        // Settings
        // this.$btnSettings = toolBar.addButton({
        //     title: 'ICore Settings',
        //     icon: 'glyphicon glyphicon-cog',
        //     clickFn: function (/*data*/) {
        //         console.log('settings');
        //     }
        // });
        //
        // this._toolbarItems.push(this.$btnSettings);

        // Load template
        var templateIds = Object.keys(this._config.templates).sort();

        if (templateIds.length > 0) {
            this.$btnLoadTemplate = toolBar.addDropDownButton({
                title: 'Load template',
                icon: 'glyphicon glyphicon-floppy-open',
                menuClass: 'no-min-width',
                clickFn: function () {
                    self.$btnLoadTemplate.clear();
                    templateIds.forEach(function (templateId) {
                        var template = self._config.templates[templateId];
                        self.$btnLoadTemplate.addButton({
                            title: template.description,
                            text: template.displayName,
                            clickFn: function () {
                                self._widget.loadTemplate(templateId);
                            }
                        });
                    });
                }
            });

            this._toolbarItems.push(this.$btnLoadTemplate);
        }

        // Save
        this.$btnSave = toolBar.addButton({
            title: 'Save code [ctrl + s]',
            icon: 'glyphicon glyphicon-floppy-disk',
            clickFn: function (/*data*/) {
                self._widget.saveCode();
            }
        });

        this._toolbarItems.push(this.$btnSave);

        // Auto-save
        this.$btnAutoSave = toolBar.addToggleButton({
            title: 'Turn ' + (self._config.codeEditor.autoSave ? 'off' : 'on') + ' auto-save',
            icon: 'glyphicon glyphicon-floppy-saved',
            clickFn: function (data, toggled) {
                self.$btnAutoSave._btn.attr('title', 'Turn ' + (toggled ? 'off' : 'on') + ' auto-save');

                ComponentSettings.updateComponentSettings('ICorePanel', {codeEditor: {autoSave: toggled}},
                    function (err, newSettings) {
                        if (err) {
                            self._logger.error(err);
                        } else {
                            WebGMEGlobal.userInfo.settings[self._configId] = newSettings;
                        }
                    });

                self._widget.setAutoSave(toggled);
            }
        });

        this.$btnAutoSave.setToggled(self._config.codeEditor.autoSave);

        this._toolbarItems.push(this.$btnAutoSave);

        this._toolbarItems.push(toolBar.addSeparator());

        // Orientation
        this.$btnOrientation = toolBar.addToggleButton({
            title: 'Switch to ' + (self._config.consoleWindow.verticalOrientation ? 'horizontal' : 'vertical') +
            ' orientation',
            icon: 'fa fa-columns',
            clickFn: function (data, toggled) {
                self.$btnOrientation._btn.attr('title', 'Switch to ' + (toggled ? 'horizontal' : 'vertical') +
                    ' orientation');

                ComponentSettings.updateComponentSettings(self._configId, {consoleWindow: {verticalOrientation: toggled}},
                    function (err, newSettings) {
                        if (err) {
                            self._logger.error(err);
                        } else {
                            WebGMEGlobal.userInfo.settings[self._configId] = newSettings;
                        }
                    });

                self._widget.setOrientation(toggled);
            }
        });

        this.$btnOrientation.setToggled(self._config.consoleWindow.verticalOrientation);

        this._toolbarItems.push(this.$btnOrientation);

        // Set log-level
        var logLvlBtn = $('<i class="log-level-btn">' + self._config.consoleWindow.logLevel + '</i>');
        this.$btnSetLogLevel = toolBar.addDropDownButton({
            title: 'Console Log Level',
            icon: logLvlBtn,
            menuClass: 'no-min-width',
            clickFn: function () {
                self.$btnSetLogLevel.clear();
                ['debug', 'info', 'warn', 'error'].forEach(function (level) {
                    self.$btnSetLogLevel.addButton({
                        title: 'Click to select level',
                        text: level,
                        clickFn: function () {
                            ComponentSettings.updateComponentSettings(self._configId, {consoleWindow: {logLevel: level}},
                                function (err, newSettings) {
                                    if (err) {
                                        self._logger.error(err);
                                    } else {
                                        WebGMEGlobal.userInfo.settings[self._configId] = newSettings;
                                    }
                                });

                            logLvlBtn.text(level);
                            self._widget.setLogLevel(level);
                        }
                    });
                });
            }
        });

        this._toolbarItems.push(this.$btnSetLogLevel);

        // Clear console
        this.$btnClearConsole = toolBar.addButton({
            title: 'Clear Console',
            icon: 'fa fa-ban',
            clickFn: function (/*data*/) {
                self._widget.clearConsole();
            }
        });

        this._toolbarItems.push(this.$btnClearConsole);

        this._toolbarItems.push(toolBar.addSeparator());

        // Execute
        this.$btnExecute = toolBar.addButton({
            title: 'Execute code [ctrl + q]',
            icon: 'glyphicon glyphicon-play-circle',
            clickFn: function (/*data*/) {
                self._widget.executeCode();
            }
        });

        this._toolbarItems.push(this.$btnExecute);

        this._toolbarItems.push(toolBar.addSeparator());

        this._toolbarInitialized = true;
    };

    return ICoreControl;
});
