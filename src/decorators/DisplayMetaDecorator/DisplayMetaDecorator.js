/*globals define, _*/
/*jshint browser: true, camelcase: false*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/DisplayMetaDecorator.DiagramDesignerWidget',
    './PartBrowser/DisplayMetaDecorator.PartBrowserWidget',
    'css!./styles/DisplayMetaDecorator.css'
], function (DecoratorBase, DisplayMetaDecoratorDiagramDesignerWidget, DisplayMetaDecoratorPartBrowserWidget) {

    'use strict';

    var DisplayMetaDecorator,
        DECORATOR_ID = 'DisplayMetaDecorator';

    DisplayMetaDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        DecoratorBase.apply(this, [opts]);

        this.logger.debug('DisplayMetaDecorator ctor');
    };

    _.extend(DisplayMetaDecorator.prototype, DecoratorBase.prototype);
    DisplayMetaDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    DisplayMetaDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: DisplayMetaDecoratorDiagramDesignerWidget,
            PartBrowser: DisplayMetaDecoratorPartBrowserWidget
        };
    };

    return DisplayMetaDecorator;
});