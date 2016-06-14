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
    'jquery',
    'underscore'
], function (
    REGISTRY_KEYS,
    CONSTANTS,
    ModelDecoratorDiagramDesignerWidget) {

    'use strict';

    var DisplayMetaDecorator,
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

        // Call the base-class method..
        ModelDecoratorDiagramDesignerWidget.prototype.on_addTo.apply(this, arguments);

        this.addMetaName(client, nodeObj);
        this.hidePortNames(client, nodeObj);
    };

    DisplayMetaDecorator.prototype.addMetaName = function (client, nodeObj) {
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

    DisplayMetaDecorator.prototype.hidePortNames = function (client) {
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

    DisplayMetaDecorator.prototype.hidePortName = function (portDiv, client, nodeObj) {
        var self = this,
            portTitle = portDiv.attr('title'),
            portId = portDiv.attr('id'),
            portNode = client.getNode(portId),
            portMetaId = portNode.getMetaTypeId(),
            portMetaNode = client.getNode(portMetaId),
            portMetaName = portMetaNode.getAttribute('name');

        portDiv.attr('title', portTitle + ' <<' + portMetaName + '>>');

        portDiv.find('.title-wrapper').remove();

    };

    DisplayMetaDecorator.prototype.destroy = function () {
        ModelDecoratorDiagramDesignerWidget.prototype.destroy.apply(this, arguments);
    };

    DisplayMetaDecorator.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        this.logger.debug('This node is on the canvas and received an update event', nodeObj);

        ModelDecoratorDiagramDesignerWidget.prototype.update.apply(this, arguments);
    };

    return DisplayMetaDecorator;
});