/*globals define, _, WebGMEGlobal*/
/**
 * This is the main "class" for the visualizer. It instantiates the controller and widget and
 * passes along the configuration settings.
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'js/PanelBase/PanelBaseWithHeader',
    'js/PanelManager/IActivePanel',
    'widgets/IFrameViz/IFrameVizWidget',
    './IFrameVizControl',
    'js/Utils/ComponentSettings'
], function (
    PanelBaseWithHeader,
    IActivePanel,
    IFrameExampleWidget,
    IFrameExampleControl,
    ComponentSettings
) {
    'use strict';

    function IFrameVizPanel(layoutManager, params) {
        var options = {};
        //set properties from options
        options[PanelBaseWithHeader.OPTIONS.LOGGER_INSTANCE_NAME] = 'IFrameVizPanel';
        options[PanelBaseWithHeader.OPTIONS.FLOATING_TITLE] = true;

        //call parent's constructor
        PanelBaseWithHeader.apply(this, [options, layoutManager]);

        this._client = params.client;

        this.config = this.getDefaultConfig();

        ComponentSettings.resolveWithWebGMEGlobal(this.config, this.getComponentId());

        //initialize UI
        this._initialize();

        this.logger.debug('ctor finished');
    }

    //inherit from PanelBaseWithHeader
    _.extend(IFrameVizPanel.prototype, PanelBaseWithHeader.prototype);
    _.extend(IFrameVizPanel.prototype, IActivePanel.prototype);

    IFrameVizPanel.prototype.getComponentId = function () {
        return 'IFrameViz';
    };

    IFrameVizPanel.prototype.getDefaultConfig = function () {
        return {
            urlAttribute: 'url'
        };
    };

    IFrameVizPanel.prototype._initialize = function () {
        var self = this;

        //set Widget title
        this.setTitle('');

        this.widget = new IFrameExampleWidget(this.logger, this.$el, this.config);

        this.widget.setTitle = function (title) {
            self.setTitle(title);
        };

        this.control = new IFrameExampleControl({
            logger: this.logger,
            client: this._client,
            widget: this.widget,
            config: this.config,
        });

        this.onActivate();
    };

    /* OVERRIDE FROM WIDGET-WITH-HEADER */
    /* METHOD CALLED WHEN THE WIDGET'S READ-ONLY PROPERTY CHANGES */
    IFrameVizPanel.prototype.onReadOnlyChanged = function (isReadOnly) {
        //apply parent's onReadOnlyChanged
        PanelBaseWithHeader.prototype.onReadOnlyChanged.call(this, isReadOnly);

    };

    IFrameVizPanel.prototype.onResize = function (width, height) {
        this.logger.debug('onResize --> width: ' + width + ', height: ' + height);
        this.widget.onWidgetContainerResize(width, height);
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    IFrameVizPanel.prototype.destroy = function () {
        this.control.destroy();
        this.widget.destroy();

        PanelBaseWithHeader.prototype.destroy.call(this);
        WebGMEGlobal.KeyboardManager.setListener(undefined);
        WebGMEGlobal.Toolbar.refresh();
    };

    IFrameVizPanel.prototype.onActivate = function () {
        this.widget.onActivate();
        this.control.onActivate();
        WebGMEGlobal.KeyboardManager.setListener(this.widget);
        WebGMEGlobal.Toolbar.refresh();
    };

    IFrameVizPanel.prototype.onDeactivate = function () {
        this.widget.onDeactivate();
        this.control.onDeactivate();
        WebGMEGlobal.KeyboardManager.setListener(undefined);
        WebGMEGlobal.Toolbar.refresh();
    };

    return IFrameVizPanel;
});
