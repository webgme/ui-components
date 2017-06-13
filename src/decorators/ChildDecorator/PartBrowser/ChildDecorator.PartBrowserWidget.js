/*globals define, _, DEBUG, $*/
/*jshint browser: true*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */


define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'text!../DiagramDesigner/ChildDecorator.DiagramDesignerWidget.html',
    'css!../DiagramDesigner/ChildDecorator.DiagramDesignerWidget.css',
    'css!./ChildDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PartBrowserWidgetDecoratorBase,
             DiagramDesignerWidgetConstants,
             ChildDecoratorDiagramDesignerWidgetTemplate) {

    'use strict';

    var ChildDecoratorPartBrowserWidget,
        __parent__ = PartBrowserWidgetDecoratorBase,
        DECORATOR_ID = 'ChildDecoratorPartBrowserWidget';

    ChildDecoratorPartBrowserWidget = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.logger.debug('ChildDecoratorPartBrowserWidget ctor');
    };

    _.extend(ChildDecoratorPartBrowserWidget.prototype, __parent__.prototype);
    ChildDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    ChildDecoratorPartBrowserWidget.prototype.$DOMBase = (function () {
        var el = $(ChildDecoratorDiagramDesignerWidgetTemplate);
        //use the same HTML template as the ChildDecorator.DiagramDesignerWidget
        //but remove the connector DOM elements since they are not needed in the PartBrowser
        el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS).remove();
        return el;
    })();

    ChildDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        //find name placeholder
        this.skinParts.$name = this.$el.find('.name');

        this._renderContent();
    };

    ChildDecoratorPartBrowserWidget.prototype.afterAppend = function () {
    };

    ChildDecoratorPartBrowserWidget.prototype._renderContent = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //render GME-ID in the DOM, for debugging
        if (DEBUG) {
            this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});
        }

        if (nodeObj) {
            this.skinParts.$name.text(nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '');
        }
    };

    ChildDecoratorPartBrowserWidget.prototype.update = function () {
        this._renderContent();
    };

    return ChildDecoratorPartBrowserWidget;
});