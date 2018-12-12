/*globals define, _, DEBUG, $*/
/*eslint-env browser*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */


define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'text!../DiagramDesigner/MultilineAttributeDecorator.DiagramDesignerWidget.html',
    'css!../DiagramDesigner/MultilineAttributeDecorator.DiagramDesignerWidget.css',
    'css!./MultilineAttributeDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PartBrowserWidgetDecoratorBase,
             DiagramDesignerWidgetConstants,
             MultilineAttributeDecoratorDiagramDesignerWidgetTemplate) {

    'use strict';

    var DECORATOR_ID = 'MultilineAttributeDecoratorPartBrowserWidget';

    function MultilineAttributeDecoratorPartBrowserWidget(options) {
        var opts = _.extend({}, options);

        PartBrowserWidgetDecoratorBase.apply(this, [opts]);

        this.logger.debug('MultilineAttributeDecoratorPartBrowserWidget ctor');
    }

    _.extend(MultilineAttributeDecoratorPartBrowserWidget.prototype, PartBrowserWidgetDecoratorBase.prototype);
    MultilineAttributeDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    MultilineAttributeDecoratorPartBrowserWidget.prototype.$DOMBase = (function () {
        var el = $(MultilineAttributeDecoratorDiagramDesignerWidgetTemplate);
        //use the same HTML template as the MultilineAttributeDecorator.DiagramDesignerWidget
        //but remove the connector DOM elements since they are not needed in the PartBrowser
        el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS).remove();
        return el;
    })();

    MultilineAttributeDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        //find name placeholder
        this.skinParts.$name = this.$el.find('.name');

        this._renderContent();
    };

    MultilineAttributeDecoratorPartBrowserWidget.prototype.afterAppend = function () {
    };

    MultilineAttributeDecoratorPartBrowserWidget.prototype._renderContent = function () {
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

    MultilineAttributeDecoratorPartBrowserWidget.prototype.update = function () {
        this._renderContent();
    };

    return MultilineAttributeDecoratorPartBrowserWidget;
});
