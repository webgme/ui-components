/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/ChildDecorator.DiagramDesignerWidget',
    './PartBrowser/ChildDecorator.PartBrowserWidget'
], function (DecoratorBase, ChildDecoratorDiagramDesignerWidget, ChildDecoratorPartBrowserWidget) {

    'use strict';

    var ChildDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'ChildDecorator';

    ChildDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('ChildDecorator ctor');
    };

    _.extend(ChildDecorator.prototype, __parent_proto__);
    ChildDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    ChildDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: ChildDecoratorDiagramDesignerWidget,
            PartBrowser: ChildDecoratorPartBrowserWidget
        };
    };

    return ChildDecorator;
});