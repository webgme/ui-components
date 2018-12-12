/* globals define, $ */

/**
 * This is the widget that creates and inserts the iframe element into the DOM.
 * It also handles user feedback via an info box that is shown if no url is set.
 * @author pmeijer / https://github.com/pmeijer
 */

define(['text!./infoBox.html', 'css!./styles/IFrameVizWidget.css'], function (infoBoxTemplate) {

    var WIDGET_CLASS = 'i-frame-viz';

    function IFrameVizWidget(logger, container, config) {
        this._logger = logger.fork('Widget');

        this._el = container;

        this._iframe = null;

        this._infoBox = null;

        this._initialize(config);

        this._logger.debug('ctor finished');
    }

    IFrameVizWidget.prototype._initialize = function (config) {
        // var width = this._el.width(),
        //     height = this._el.height(),
        //     self = this;

        // set widget class
        this._el.addClass(WIDGET_CLASS);
        this._infoBox = $(infoBoxTemplate);

        this._infoBox.find('.info-box-desc').text('The active node does not have a value for the url attribute "' +
        config.urlAttribute + '" or the attribute is not even defined.');

        this._infoBox.hide();

        this._el.append(this._infoBox);
    };

    IFrameVizWidget.prototype.onWidgetContainerResize = function (width, height) {
        this._logger.debug('Widget is resizing...');
    };

    IFrameVizWidget.prototype.addIFrame = function (desc) {
        this._iframe = $('<iframe>', {
            src: desc.iframeSrc,
        });

        this._iframe.css({
            width: '100%',
            height: '100%',
        });

        this._infoBox.hide();

        this._iframe.on('error', () => {
            this.safeRemoveIFrame();
        });

        this._el.append(this._iframe);
    };

    IFrameVizWidget.prototype.safeRemoveIFrame = function () {
        if (this._iframe) {
            this._iframe.remove();
            this._iframe = null;
        }

        this._infoBox.show();
    };

    // Adding/Removing/Updating items
    IFrameVizWidget.prototype.addNode = function (desc) {
        this.safeRemoveIFrame();

        if (desc && desc.iframeSrc) {
            this.addIFrame(desc);
        }
    };

    IFrameVizWidget.prototype.removeNode = function (gmeId) {

        this.safeRemoveIFrame();
    };

    IFrameVizWidget.prototype.updateNode = function (desc) {
        if (desc && desc.iframeSrc) {
            this._logger.debug('Updating node:', desc);
            if (this._iframe) {
                if (this._iframe.attr('src') !== desc.iframeSrc) {
                    this._iframe.attr('src', desc.iframeSrc);
                }
            } else {
                this.addIFrame(desc);
            }
        } else if (this._iframe) {
            this.safeRemoveIFrame();
        }
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    IFrameVizWidget.prototype.destroy = function () {
        this.safeRemoveIFrame();
    };

    IFrameVizWidget.prototype.onActivate = function () {
        this._logger.debug('IFrameVizWidget has been activated');
    };

    IFrameVizWidget.prototype.onDeactivate = function () {
        this._logger.debug('IFrameVizWidget has been deactivated');
    };

    return IFrameVizWidget;
});
