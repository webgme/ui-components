/*globals define*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'plugin/managerbase',
    'plugin/PluginBase',
    'blob/BlobClient'
], function (PluginManager, PluginBase, BlobClient) {
    'use strict';

    var PLUGIN_META_DATA = {
        id: 'ICore',
        name: 'ICore',
        version: '1.0.0',
        description: 'Plugin by ICore',
        icon: {
            src: '',
            class: 'fa fa-cogs'
        },
        disableServerSideExecution: false,
        disableBrowserSideExecution: false,
        writeAccessRequired: false,
        configStructure: []
    };

    function PluginEvaluator() {

    }

    PluginEvaluator.prototype.evaluateCode = function (callback) {
        var self = this,
            code = this._widget.getCode(),
            blobClient,
            plugin,
            pluginManager,
            context,
            logger,
            mainFn;

        try {
            eval('mainFn = ' + code + ';');
        } catch (e) {
            callback(e);
            return;
        }

        if (typeof mainFn !== 'function') {
            callback(new Error('Evaluated code does not define a function'));
            return;
        }

        // The main function is "OK" we instantiate the plugin
        plugin = new PluginBase();
        plugin.main = mainFn;
        plugin.pluginMetadata = PLUGIN_META_DATA;

        // initialize the plugin
        logger = {
            debug: function () {
                self._widget.addConsoleMessage('debug', Array.prototype.slice.call(arguments));
            },
            info: function () {
                self._widget.addConsoleMessage('info', Array.prototype.slice.call(arguments));
            },
            warn: function () {
                self._widget.addConsoleMessage('warn', Array.prototype.slice.call(arguments));
            },
            error: function () {
                self._widget.addConsoleMessage('error', Array.prototype.slice.call(arguments));
            }
        };

        blobClient = new BlobClient({logger: this._logger.fork('BlobClient')});

        plugin.initialize(logger, blobClient, this._client.gmeConfig);

        // configure the pluginManager and plugin.
        pluginManager = new PluginManager(blobClient, null, this._logger, this._client.gmeConfig);
        pluginManager.browserSide = true;
        pluginManager.notificationHandlers = [function (data, cb) {
            self._client.dispatchPluginNotification(data);
            cb(null);
        }];

        pluginManager.projectAccess = self._client.getProjectAccess();

        context = this._getPluginContext();

        pluginManager.configurePlugin(plugin, context.pluginConfig, context.managerConfig)
            .then(function () {
                plugin.main(function (err) {
                    callback(err);
                });
            })
            .catch(callback);
    };

    PluginEvaluator.prototype._getPluginContext = function () {
        var client = this._client;
        return {
            managerConfig: {
                project: client.getProjectObject(),
                branchName: client.getActiveBranchName(),
                commitHash: client.getActiveCommitHash(),
                activeNode: this._currentNodeId,
                activeSelection: [],
                namespace: ''
            },
            pluginConfig: null
        };
    };

    return PluginEvaluator;
});