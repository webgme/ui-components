/**
 * Created by James Klingler on 6/27/2016.
 */
define([], function () {

    function updateMetaNameDiv(self, client, nodeObj) {

        addMetaNameDiv(self);

        var metaId = nodeObj.getMetaTypeId(),
            metaNode = client.getNode(metaId),
            metaName = metaNode.getAttribute('name'),
            divString = '<<' + metaName + '>>';

        self.skinParts.$metaName.attr('title', divString);
        self.skinParts.$metaName.text(divString);
    }

    function addMetaNameDiv(self) {

        if (typeof self.skinParts.$metaName === "undefined") {

            var metaNameDiv = $('<div>', {
                class: 'meta-name'
            });

            metaNameDiv.insertAfter(self.skinParts.$name);
            self.skinParts.$metaName = self.$el.find('.meta-name');
        }
    }

    function hidePortNames(self, client) {

        var atPort = function () {
            var portId = $(this).attr('id'),
                portNode = client.getNode(portId),
                portMetaId = portNode.getMetaTypeId(),
                portMetaNode = client.getNode(portMetaId),
                portMetaName = portMetaNode.getAttribute('name'),
                portNodeName = portNode.getAttribute('name');

            $(this).attr('title', portNodeName + ' <<' + portMetaName + '>>');

            $(this).find('.title-wrapper').remove();
        };

        self.skinParts.$portsContainer.find('.port').each(atPort);
    }

    return {
        updateMetaNameDiv: updateMetaNameDiv,
        hidePortNames: hidePortNames
    };

});

