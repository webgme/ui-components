/*globals define, _*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/MultilineAttributeDecorator.DiagramDesignerWidget',
    './PartBrowser/MultilineAttributeDecorator.PartBrowserWidget'
], function (DecoratorBase, MultilineAttributeDecoratorDiagramDesignerWidget, MultilineAttributeDecoratorPartBrowserWidget) {

    'use strict';

    var DECORATOR_ID = 'MultilineAttributeDecorator';

     function MultilineAttributeDecorator(params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        DecoratorBase.apply(this, [opts]);

        this.logger.debug('MultilineAttributeDecorator ctor');
    }

    _.extend(MultilineAttributeDecorator.prototype, DecoratorBase.prototype);
    MultilineAttributeDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    MultilineAttributeDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: MultilineAttributeDecoratorDiagramDesignerWidget,
            PartBrowser: MultilineAttributeDecoratorPartBrowserWidget
        };
    };

    return MultilineAttributeDecorator;
});
