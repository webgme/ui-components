/*globals define, _*/
/*jshint browser: true, camelcase: false*/
/**
 * This decorator inherits from the ModelDecorator.DiagramDesignerWidget.
 * With no changes to the methods - it will functions just like the ModelDecorator.
 *
 * For more methods see the ModelDecorator.DiagramDesignerWidget.js in the webgme repository.
 *
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'js/RegistryKeys',
    'js/Constants',
    'decorators/ModelDecorator/DiagramDesigner/ModelDecorator.DiagramDesignerWidget',
    './../UtilityFunctions',
    'jquery',
    'underscore'
], function (
    REGISTRY_KEYS,
    CONSTANTS,
    ModelDecoratorDiagramDesignerWidget,
    UtilityFunctions) {

    'use strict';

    var DisplayMetaDecorator,
        PORT_POSITION_OFFSET_Y = 13,
        DECORATOR_ID = 'DisplayMetaDecorator';

    DisplayMetaDecorator = function (options) {
        var opts = _.extend({}, options);

        ModelDecoratorDiagramDesignerWidget.apply(this, [opts]);

        this.logger.debug('DisplayMetaDecorator ctor');
    };

    DisplayMetaDecorator.prototype = Object.create(ModelDecoratorDiagramDesignerWidget.prototype);
    DisplayMetaDecorator.prototype.constructor = DisplayMetaDecorator;
    DisplayMetaDecorator.prototype.DECORATORID = DECORATOR_ID;

    DisplayMetaDecorator.prototype.on_addTo = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        this.logger.debug('This node was added to the canvas', nodeObj);
        this.$el.addClass('display-meta-decorator');
        // Call the base-class method...
        ModelDecoratorDiagramDesignerWidget.prototype.on_addTo.apply(this, arguments);

        UtilityFunctions.updateMetaNameDiv(this, client, nodeObj);
        UtilityFunctions.hidePortNames(this, client);
    };

    DisplayMetaDecorator.prototype.destroy = function () {
        ModelDecoratorDiagramDesignerWidget.prototype.destroy.apply(this, arguments);
    };

    DisplayMetaDecorator.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        this.logger.debug('This node is on the canvas and received an update event', nodeObj);

        ModelDecoratorDiagramDesignerWidget.prototype.update.apply(this, arguments);

        // this causes another <<MetaName>> div to be added every time the model changes
        UtilityFunctions.updateMetaNameDiv(this, client, nodeObj);
        UtilityFunctions.hidePortNames(this, client);
    };

    DisplayMetaDecorator.prototype.getConnectionAreas = function (id/*, isEnd, connectionMetaInfo*/) {
        var result;

        result = ModelDecoratorDiagramDesignerWidget.prototype.getConnectionAreas.apply(this, arguments);
        result.forEach(function (connArea) {
            // Ports have numbered ids..
            if (typeof connArea.id === 'number') {
                // for these add compensation for the meta-name div.
                connArea.y1 += PORT_POSITION_OFFSET_Y;
                connArea.y2 += PORT_POSITION_OFFSET_Y;
            }
        });

        return result;
    };

    DisplayMetaDecorator.prototype._updateColors = function () {
        ModelDecoratorDiagramDesignerWidget.prototype._updateColors.apply(this, arguments);
        if (!this.fillColor) {
            this.$el.css({'background-color': 'white'});
        }
    };

    return DisplayMetaDecorator;
});