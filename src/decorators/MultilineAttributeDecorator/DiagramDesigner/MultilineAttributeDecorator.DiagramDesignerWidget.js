/*globals define, _, $*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Constants',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.DecoratorBase',
    'text!./MultilineAttributeDecorator.DiagramDesignerWidget.html',
    'css!./MultilineAttributeDecorator.DiagramDesignerWidget.css'
], function (CONSTANTS, DiagramDesignerWidgetDecoratorBase, MultilineAttributeDecoratorTemplate) {

    'use strict';

    var DECORATOR_ID = 'MultilineAttributeDecorator';

    function MultilineAttributeDecorator(options) {
        var opts = _.extend({}, options);

        DiagramDesignerWidgetDecoratorBase.apply(this, [opts]);

        this.name = '';

        this.logger.debug('MultilineAttributeDecorator ctor');
    }

    _.extend(MultilineAttributeDecorator.prototype, DiagramDesignerWidgetDecoratorBase.prototype);
    MultilineAttributeDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    MultilineAttributeDecorator.prototype.$DOMBase = $(MultilineAttributeDecoratorTemplate);

    MultilineAttributeDecorator.prototype.on_addTo = function () {
        var self = this;

        this.nodeId = this._metaInfo[CONSTANTS.GME_ID];
        this.client = this._control._client;
        this.$name = this.$el.find('.name');
        this.$attributeContainer = this.$el.find('.attribute-container');
        this.fields = {
            // <attrName>: {
            //   el: <$el>,
            //   value: <string>,
            //   name: <string>
            //   type: <null||string>
            // }
        };

        // set title editable on double-click
        this.$name.on('dblclick.editOnDblClick', null, function (event) {
            if (self.hostDesignerItem.canvas.getIsReadOnlyMode() !== true) {
                $(this).editInPlace({
                    class: '',
                    onChange: function (oldValue, newValue) {
                        self.client.setAttribute(self.nodeId, 'name', newValue);
                    }
                });
            }

            event.stopPropagation();
            event.preventDefault();
        });

        this._renderName();
        this._renderAttributeFields();
    };

    MultilineAttributeDecorator.prototype.update = function () {
        this._renderName();
        this._renderAttributeFields();
    };

    MultilineAttributeDecorator.prototype._renderAttributeFields = function () {
        var self = this,
            nodeObj = this.client.getNode(this.nodeId),
            newFields = {},
            insertionsMade = false;

        debugger;
        if (!nodeObj) {
            return;
        }

       nodeObj.getValidAttributeNames()
           .forEach(function (attrName) {
               var attrMeta = nodeObj.getAttributeMeta(attrName),
                   value;
               if (attrMeta.type === 'string' && attrMeta.multiline) {
                   newFields[attrName] = true;
                   value = nodeObj.getAttribute(attrName) || '';

                   if (self.fields[attrName]) {
                       // update
                       if (self.fields[attrName].value !== value) {
                           self.fields[attrName].value = value;
                           self._updateFieldValue(attrName, value);
                       }

                       if (self.fields[attrName].type !== attrMeta.multilineType) {
                           self.fields[attrName].type = attrMeta.multilineType;
                           self._updateFieldType(attrName, attrMeta.multilineType);
                       }
                   } else {
                       // add
                       insertionsMade = true;
                       self.fields[attrName] = {
                           el: self._getNewFieldElement({name: attrName, value: value}),
                           name: attrName,
                           type: attrMeta.multilineType,
                           value: value
                       };

                       self.$attributeContainer.append(self.fields[attrName].el);
                   }
               }
           });

        // remove
        Object.keys(self.fields)
            .forEach(function (attrName) {
                if (!newFields[attrName]) {
                    self._removeFieldElement(attrName);
                    delete self.fields[attrName];
                }
            });


        if (insertionsMade) {
            this.$attributeContainer.children().sort(function(a, b) {
                return $(a).data('name') > $(b).data('name');
            }).appendTo(this.$attributeContainer);
        }
    };

    MultilineAttributeDecorator.prototype._getNewFieldElement = function (desc) {
        var el = $('<div>', {
            class: 'attribute-field',
        });

        el.data('name', desc.name);

        el.append($('<div>', {
            class: 'title',
            text: desc.name,
        }));

        el.append($('<div>', {
            class: 'content',
            text: desc.value,
        }));

        return el;
    };

    MultilineAttributeDecorator.prototype._updateFieldValue = function (attrName, value) {
        this.fields[attrName].el.find('.content').text(value);
    };

    MultilineAttributeDecorator.prototype._updateFieldType = function (attrName, type) {
        console.log('do not care');
    };

    MultilineAttributeDecorator.prototype._removeFieldElement = function (attrName) {
        this.fields[attrName].el.remove();
    };

    MultilineAttributeDecorator.prototype._renderName = function () {
        var nodeObj = this.client.getNode(this.nodeId),
            name;

        if (nodeObj) {
            name = nodeObj.getAttribute('name') || '';
        }

        if (name !== this.name) {
            this.name = name;
            this.$name.text(this.name);
        }
    };

    MultilineAttributeDecorator.prototype.getConnectionAreas = function (id /*, isEnd, connectionMetaInfo*/) {
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

    MultilineAttributeDecorator.prototype.doSearch = function (searchDesc) {
        var searchText = searchDesc.toString();

        if (this.name &&
            this.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
            return true;
        }

        return false;
    };

    return MultilineAttributeDecorator;
});
