/*globals define, _, $*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'js/Constants',
    'js/Utils/ComponentSettings',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.DecoratorBase',
    'decorators/ModelDecorator/Core/ModelDecorator.Core',
    'text!./MultilineAttributeDecorator.DiagramDesignerWidget.html',
    'css!./MultilineAttributeDecorator.DiagramDesignerWidget.css'
], function (CONSTANTS,
             ComponentSettings,
             DiagramDesignerWidgetDecoratorBase,
             ModelDecoratorCore,
             MultilineAttributeDecoratorTemplate) {

    'use strict';

    var DECORATOR_ID = 'MultilineAttributeDecorator',
        HEIGHT_REG_KEY = 'decoratorHeight',
        WIDTH_REG_KEY = 'decoratorWidth',
        MIN_WIDTH = 120,
        MIN_HEIGHT = 80;

    function MultilineAttributeDecorator(options) {
        var opts = _.extend({}, options);

        DiagramDesignerWidgetDecoratorBase.apply(this, [opts]);

        this.config = this.getDefaultConfig();
        ComponentSettings.resolveWithWebGMEGlobal(this.config, this.getComponentId());

        this.name = '';
        this.size = {
            width: MIN_WIDTH,
            height: MIN_HEIGHT
        };

        this.fields = {
            // <attrName>: {
            //   el: <$el>,
            //   value: <string>,
            //   name: <string>,
            //   type: <null||string>,
            //   lineCnt: <number>
            // }
        };

        this.logger.debug('MultilineAttributeDecorator ctor');
    }

    _.extend(MultilineAttributeDecorator.prototype, DiagramDesignerWidgetDecoratorBase.prototype);
    MultilineAttributeDecorator.prototype.DECORATORID = DECORATOR_ID;

    MultilineAttributeDecorator.prototype.getComponentId = function () {
        return DECORATOR_ID;
    };

    MultilineAttributeDecorator.prototype.getDefaultConfig = function () {
        return {
            textAlign: 'left',
            attrBlackList: [],
        };
    };

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    MultilineAttributeDecorator.prototype.$DOMBase = $(MultilineAttributeDecoratorTemplate);

    MultilineAttributeDecorator.prototype.on_addTo = function () {
        var self = this;

        // initializations
        this.nodeId = this._metaInfo[CONSTANTS.GME_ID];
        this.client = this._control._client;
        this.$name = this.$el.find('.name');
        this.$attributeContainer = this.$el.find('.attribute-container');
        this.$reszieIcon = this.$el.find('.resize-icon');
        this.mouseStartPos = null;
        this.elStartSize = null;

        // event handlers
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

        function calculateNewSize(event) {
            var dX = event.pageX - self.mouseStartPos.x,
                dY = event.pageY - self.mouseStartPos.y,
                width = self.elStartSize.width,
                height = self.elStartSize.height,
                newX,
                newY;

            dX = dX / self.hostDesignerItem.canvas._zoomRatio;
            dY = dY / self.hostDesignerItem.canvas._zoomRatio;
            newX = width + dX;
            newY = height + dY;

            newX = newX > MIN_WIDTH ? newX : MIN_WIDTH;
            newY = newY > MIN_HEIGHT ? newY : MIN_HEIGHT;

            return {
                width: Math.round(newX),
                height: Math.round(newY)
            };
        }

        function mouseMoveHandler(event) {
            var newSize = calculateNewSize(event);

            self.$el.width(newSize.width);
            self.$el.height(newSize.height);
            event.stopPropagation();
            event.preventDefault();
        }

        function mouseUpHandler(event) {
            var newSize = calculateNewSize(event);

            self.mouseStartPos = null;
            self.mouseCurrPos = null;
            $(document).off('mousemove', mouseMoveHandler);
            $(document).off('mouseup', mouseUpHandler);

            self.client.startTransaction();
            self.client.setRegistry(self.nodeId, WIDTH_REG_KEY, newSize.width);
            self.client.setRegistry(self.nodeId, HEIGHT_REG_KEY, newSize.height);
            self.client.completeTransaction();
        }

        this.$reszieIcon.on('mousedown', function (event) {
            self.mouseStartPos = {
                x: event.pageX,
                y: event.pageY,
            };

            self.elStartSize = {
                width: self.$el.width(),
                height: self.$el.height()
            };

            console.log('mouse down on icon', JSON.stringify(self.mouseStartPos));

            $(document).on('mousemove', mouseMoveHandler);
            $(document).on('mouseup', mouseUpHandler);

            event.stopPropagation();
            event.preventDefault();
        });

        // Render the stuff.
        this._renderSize();
        this._renderName();
        this._renderAttributeFields();
        this._renderColors();
    };

    MultilineAttributeDecorator.prototype.update = function () {
        this._renderSize();
        this._renderName();
        this._renderAttributeFields();
        this._renderColors();
    };

    MultilineAttributeDecorator.prototype._renderSize = function () {
        var nodeObj = this.client.getNode(this.nodeId),
            width,
            height;

        if (nodeObj) {
            width = nodeObj.getRegistry(WIDTH_REG_KEY);
            height = nodeObj.getRegistry(HEIGHT_REG_KEY);
        }

        if (width && width !== this.size.width) {
            this.size.width = width;
            this.$el.width(width);
        }

        if (height && height !== this.size.height) {
            this.size.height = height;
            this.$el.height(height);
        }
    };

    MultilineAttributeDecorator.prototype._renderAttributeFields = function () {
        var self = this,
            nodeObj = this.client.getNode(this.nodeId),
            newFields = {},
            totalNbrOfLines = 0,
            insertionsMade = false;

        if (!nodeObj) {
            return;
        }

        nodeObj.getValidAttributeNames()
            .sort()
            .forEach(function (attrName) {
                var attrMeta = nodeObj.getAttributeMeta(attrName),
                    value;
                if (attrMeta.type === 'string' && attrMeta.multiline &&
                    self.config.attrBlackList.indexOf(attrName) === -1) {

                    newFields[attrName] = true;
                    value = nodeObj.getAttribute(attrName) || '';

                    if (self.fields[attrName]) {
                        // update
                        if (self.fields[attrName].value !== value) {
                            self._updateFieldValue(attrName, value);
                        }

                        if (self.fields[attrName].type !== attrMeta.multilineType) {
                            self._updateFieldType(attrName, attrMeta.multilineType);
                        }
                    } else {
                        // add
                        insertionsMade = true;
                        self.fields[attrName] = {
                            el: self._getNewFieldElement({name: attrName, value: value}),
                            name: attrName,
                            type: attrMeta.multilineType,
                            value: value,
                            lineCnt: (value.match(/\r?\n/g) || '').length + 1 + 2, // +2 account for title
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
                } else {
                    totalNbrOfLines += self.fields[attrName].lineCnt;
                }
            });

        // finally assign real estate based on number of lines
        Object.keys(self.fields)
            .forEach(function (attrName) {
                var heightRatio = self.fields[attrName].lineCnt / totalNbrOfLines;
                self.fields[attrName].el.css('height', heightRatio * 100 + '%');
            });
    };

    MultilineAttributeDecorator.prototype._getNewFieldElement = function (desc) {
        var self = this,
            el = $('<div>', {
                class: 'attribute-field',
            });

        el.data('name', desc.name);

        el.append($('<div>', {
            class: 'title',
            text: desc.name,
        }));

        el.append(
            $('<textarea>', {
                class: 'content',
                text: desc.value,
            })
                .on('dblclick', function (event) {
                    if (self.hostDesignerItem.canvas.getIsReadOnlyMode() === true) {
                        return;
                    }
                    console.log($(this).is(':focus'));
                    $(this).focus();
                    event.stopPropagation();
                    event.preventDefault();
                })
                .on('mousedown', function (event) {
                    if (self.hostDesignerItem.canvas.getIsReadOnlyMode() === true) {
                        return;
                    }

                    event.stopPropagation();
                })
                .on('keyup', function (event) {
                    if (event.which === 27) {
                        console.log('esc pressed');
                        $(this).val(self.fields[desc.name].value);
                        $(this).blur();
                    }
                })
                .on('blur', function () {
                    var nodeObj = self.client.getNode(self.nodeId);
                    if ($(this).val() !== self.fields[desc.name].value && nodeObj && nodeObj.isReadOnly() === false) {
                        self.client.setAttribute(self.nodeId, desc.name, $(this).val());
                    }
                })
                .css({
                    textAlign: this.config.textAlign,
                })
        );

        return el;
    };

    MultilineAttributeDecorator.prototype._updateFieldValue = function (attrName, value) {
        this.fields[attrName].el.find('.content').text(value);
        this.fields[attrName].value = value;
        this.fields[attrName].lineCnt = (value.match(/\r?\n/g) || '').length + 1 + 2; // +2 account for title
    };

    MultilineAttributeDecorator.prototype._updateFieldType = function (attrName, type) {
        self.fields[attrName].type = type;
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

    MultilineAttributeDecorator.prototype._renderColors = function () {
        ModelDecoratorCore.prototype._getNodeColorsFromRegistry.apply(this);

        var self = this,
            style = {
                backgroundColor: this.fillColor ? this.fillColor : '',
                borderColor: this.borderColor ? this.borderColor : '',
                color: this.textColor ? this.textColor : '',
            };

        this.$el.css(style);

        Object.keys(self.fields)
            .forEach(function (attrName) {
                self.fields[attrName].el.find('textarea').css(style);
            });
    };

    return MultilineAttributeDecorator;
});
