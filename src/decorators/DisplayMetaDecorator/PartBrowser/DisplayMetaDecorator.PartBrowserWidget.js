/*globals define, _*/
/*jshint browser: true*/
/**
 * This decorator inherits from the ModelDecorator.PartBrowserWidget.
 * With no changes to the methods - it will functions just like the ModelDecorator.
 *
 * For more methods see the ModelDecorator.PartBrowserWidget.js in the webgme repository.
 *
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'js/Constants',
    'decorators/ModelDecorator/PartBrowser/ModelDecorator.PartBrowserWidget',
    './../UtilityFunctions',
    'jquery',
    'underscore'
], function (
    CONSTANTS,
    ModelDecoratorPartBrowserWidget,
    UtilityFunctions) {

    'use strict';

    var DisplayMetaDecoratorPartBrowserWidget,
        DECORATOR_ID = 'DisplayMetaDecoratorPartBrowserWidget';

    DisplayMetaDecoratorPartBrowserWidget = function (options) {
        var opts = _.extend({}, options);

        ModelDecoratorPartBrowserWidget.apply(this, [opts]);

        this.logger.debug('DisplayMetaDecoratorPartBrowserWidget ctor');
    };

    _.extend(DisplayMetaDecoratorPartBrowserWidget.prototype, ModelDecoratorPartBrowserWidget.prototype);
    DisplayMetaDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    DisplayMetaDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el.addClass('display-meta-decorator');
        ModelDecoratorPartBrowserWidget.prototype.beforeAppend.apply(this, arguments);
    };

    DisplayMetaDecoratorPartBrowserWidget.prototype.afterAppend = function () {
        ModelDecoratorPartBrowserWidget.prototype.afterAppend.apply(this, arguments);
    };

    DisplayMetaDecoratorPartBrowserWidget.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        ModelDecoratorPartBrowserWidget.prototype.update.apply(this, arguments);

        UtilityFunctions.updateMetaNameDiv(this, client, nodeObj);
    };

    DisplayMetaDecoratorPartBrowserWidget.prototype._updateColors = function () {
        ModelDecoratorPartBrowserWidget.prototype._updateColors.apply(this, arguments);
        if (!this.fillColor) {
            this.$el.css({'background-color': 'white'});
        }
    };

    return DisplayMetaDecoratorPartBrowserWidget;
});