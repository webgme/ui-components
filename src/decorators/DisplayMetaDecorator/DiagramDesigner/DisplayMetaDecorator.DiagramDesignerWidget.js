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
        // Call the base-class method..
        ModelDecoratorDiagramDesignerWidget.prototype.on_addTo.apply(this, arguments);

        UtilityFunctions.addMetaName(this, client, nodeObj);
        UtilityFunctions.hidePortNames(this, client);

//        this._addMetaName(client, nodeObj);
//        this._hidePortNames(client);
    };

    DisplayMetaDecorator.prototype._addMetaName = function (client, nodeObj) {
        var self = this,
            metaId = nodeObj.getMetaTypeId(),
            metaNode = client.getNode(metaId),
            metaName = metaNode.getAttribute('name'),
            divString = '<<' + metaName + '>>',
            metaNameDiv = $('<div>', {
            class: 'meta-name',
            title: divString,
            text: divString
        });

        metaNameDiv.insertAfter(this.skinParts.$name);
    };

    DisplayMetaDecorator.prototype._hidePortNames = function (client) {
        var self = this,
            portTitle = '',
            portId = '',
            portNode = '',
            portMetaId = '',
            portMetaNode = '',
            portMetaName = '';

        this.skinParts.$portsContainerLeft.find('.port').each(function() {
            portTitle = $(this).attr('title');
            portId = $(this).attr('id');
            portNode = client.getNode(portId);
            portMetaId = portNode.getMetaTypeId();
            portMetaNode = client.getNode(portMetaId);
            portMetaName = portMetaNode.getAttribute('name');

            $(this).attr('title', portTitle + ' <<' + portMetaName + '>>');

            $(this).find('.title-wrapper').remove();
        });

        this.skinParts.$portsContainerCenter.find('.port').each(function() {
            portTitle = $(this).attr('title');
            portId = $(this).attr('id');
            portNode = client.getNode(portId);
            portMetaId = portNode.getMetaTypeId();
            portMetaNode = client.getNode(portMetaId);
            portMetaName = portMetaNode.getAttribute('name');

            $(this).attr('title', portTitle + ' <<' + portMetaName + '>>');

            $(this).find('.title-wrapper').remove();
        });

        this.skinParts.$portsContainerRight.find('.port').each(function() {
            portTitle = $(this).attr('title');
            portId = $(this).attr('id');
            portNode = client.getNode(portId);
            portMetaId = portNode.getMetaTypeId();
            portMetaNode = client.getNode(portMetaId);
            portMetaName = portMetaNode.getAttribute('name');

            $(this).attr('title', portTitle + ' <<' + portMetaName + '>>');

            $(this).find('.title-wrapper').remove();
        });
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
        UtilityFunctions.addMetaName(this, client, nodeObj);
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

    return DisplayMetaDecorator;
});