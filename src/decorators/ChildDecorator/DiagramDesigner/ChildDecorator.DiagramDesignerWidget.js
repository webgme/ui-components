/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.DecoratorBase',
    'text!./ChildDecorator.DiagramDesignerWidget.html',
    'css!./ChildDecorator.DiagramDesignerWidget.css'
], function (CONSTANTS, nodePropertyNames, DiagramDesignerWidgetDecoratorBase, ChildDecoratorTemplate) {

    'use strict';

    var ChildDecorator,
        __parent__ = DiagramDesignerWidgetDecoratorBase,
        __parent_proto__ = DiagramDesignerWidgetDecoratorBase.prototype,
        DECORATOR_ID = 'ChildDecorator';

    ChildDecorator = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.name = '';

        this.logger.debug('ChildDecorator ctor');
    };

    _.extend(ChildDecorator.prototype, __parent_proto__);
    ChildDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    ChildDecorator.prototype.$DOMBase = $(ChildDecoratorTemplate);

    ChildDecorator.prototype.on_addTo = function () {
        var self = this,
            client = this._control._client,
            gmeId = this._metaInfo[CONSTANTS.GME_ID],
            nodeObj = client.getNode(gmeId);

        this.childrenIds = {};

        nodeObj.getChildrenIds().forEach(function (childId) {
            self.childrenIds[childId] = true;

            self._control.registerComponentIDForPartID(childId, gmeId);
        });

        console.log('Current children', JSON.stringify(self.childrenIds, null, 2));

        this._renderName();

        // set title editable on double-click
        this.skinParts.$name.on('dblclick.editOnDblClick', null, function (event) {
            if (self.hostDesignerItem.canvas.getIsReadOnlyMode() !== true) {
                $(this).editInPlace({
                    class: '',
                    onChange: function (oldValue, newValue) {
                        self._onNodeTitleChanged(oldValue, newValue);
                    }
                });
            }
            event.stopPropagation();
            event.preventDefault();
        });

        //let the parent decorator class do its job first
        __parent_proto__.on_addTo.apply(this, arguments);
    };

    ChildDecorator.prototype._renderName = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //render GME-ID in the DOM, for debugging
        this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});

        if (nodeObj) {
            this.name = nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '';
        }

        //find name placeholder
        this.skinParts.$name = this.$el.find('.name');
        this.skinParts.$name.text(this.name);
    };

    ChildDecorator.prototype.update = function () {
        var self = this,
            client = this._control._client,
            gmeId = this._metaInfo[CONSTANTS.GME_ID],
            nodeObj = client.getNode(gmeId),
            newChildren = {},
            newName = '';

        console.log('update');

        if (nodeObj) {
            newName = nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '';

            if (this.name !== newName) {
                this.name = newName;
                this.skinParts.$name.text(this.name);
            }

            nodeObj.getChildrenIds().forEach(function (childId) {
                newChildren[childId] = true;
                if (!self.childrenIds[childId]) {
                    self.childrenIds[childId] = true;
                    self._control.registerComponentIDForPartID(childId, gmeId);
                }
            });

            Object.keys(this.childrenIds).forEach(function (oldId) {
                if (newChildren.hasOwnProperty(oldId) === false) {
                    self._control.unregisterComponentIDFromPartID(oldId, gmeId);
                    delete self.childrenIds[oldId];
                }
            });

            console.log('Current children', JSON.stringify(self.childrenIds, null, 2));
        }
    };

    ChildDecorator.prototype.getConnectionAreas = function (id /*, isEnd, connectionMetaInfo*/) {
        var result = [],
            edge = 10,
            LEN = 20;

        //by default return the bounding box edge's midpoints

        if (id === undefined || id === this.hostDesignerItem.id) {
            //NORTH
            result.push({
                id: '0',
                x1: edge,
                y1: 0,
                x2: this.hostDesignerItem.getWidth() - edge,
                y2: 0,
                angle1: 270,
                angle2: 270,
                len: LEN
            });

            //EAST
            result.push({
                id: '1',
                x1: this.hostDesignerItem.getWidth(),
                y1: edge,
                x2: this.hostDesignerItem.getWidth(),
                y2: this.hostDesignerItem.getHeight() - edge,
                angle1: 0,
                angle2: 0,
                len: LEN
            });

            //SOUTH
            result.push({
                id: '2',
                x1: edge,
                y1: this.hostDesignerItem.getHeight(),
                x2: this.hostDesignerItem.getWidth() - edge,
                y2: this.hostDesignerItem.getHeight(),
                angle1: 90,
                angle2: 90,
                len: LEN
            });

            //WEST
            result.push({
                id: '3',
                x1: 0,
                y1: edge,
                x2: 0,
                y2: this.hostDesignerItem.getHeight() - edge,
                angle1: 180,
                angle2: 180,
                len: LEN
            });
        }

        return result;
    };

    /**************** EDIT NODE TITLE ************************/

    ChildDecorator.prototype._onNodeTitleChanged = function (oldValue, newValue) {
        var client = this._control._client;

        client.setAttribute(this._metaInfo[CONSTANTS.GME_ID], nodePropertyNames.Attributes.name, newValue);
    };

    /**************** END OF - EDIT NODE TITLE ************************/

    ChildDecorator.prototype.doSearch = function (searchDesc) {
        var searchText = searchDesc.toString();
        if (this.name && this.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
            return true;
        }

        return false;
    };

    // Handling of children
    ChildDecorator.prototype.getTerritoryQuery = function () {
        var territoryRule = {},
            gmeID = this._metaInfo[CONSTANTS.GME_ID];

        territoryRule[gmeID] = {children: 1};

        return territoryRule;
    };

    ChildDecorator.prototype.notifyComponentEvent = function (events) {
        console.log(JSON.stringify(events, null, 2));
    };

    //
    // ChildDecorator.prototype.destroy = function () {
    //     // Unregister all sub components.
    // };

    return ChildDecorator;
});