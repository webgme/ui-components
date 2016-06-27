/**
 * Created by James Klingler on 6/27/2016.
 */
define([], function () {

    function addMetaName(self, client, nodeObj) {
        var metaId = nodeObj.getMetaTypeId(),
            metaNode = client.getNode(metaId),
            metaName = metaNode.getAttribute('name'),
            divString = '<<' + metaName + '>>',
            metaNameDiv = $('<div>', {
                class: 'meta-name',
                title: divString,
                text: divString
            });

        metaNameDiv.insertAfter(self.skinParts.$name);
    }

    function hidePortNames(self, client) {
        var portTitle,
            portId,
            portNode,
            portMetaId,
            portMetaNode,
            portMetaName;

        self.skinParts.$portsContainerLeft.find('.port').each(function() {
            portTitle = $(this).attr('title');
            portId = $(this).attr('id');
            portNode = client.getNode(portId);
            portMetaId = portNode.getMetaTypeId();
            portMetaNode = client.getNode(portMetaId);
            portMetaName = portMetaNode.getAttribute('name');

            $(this).attr('title', portTitle + ' <<' + portMetaName + '>>');

            $(this).find('.title-wrapper').remove();
        });

        self.skinParts.$portsContainerCenter.find('.port').each(function() {
            portTitle = $(this).attr('title');
            portId = $(this).attr('id');
            portNode = client.getNode(portId);
            portMetaId = portNode.getMetaTypeId();
            portMetaNode = client.getNode(portMetaId);
            portMetaName = portMetaNode.getAttribute('name');

            $(this).attr('title', portTitle + ' <<' + portMetaName + '>>');

            $(this).find('.title-wrapper').remove();
        });

        self.skinParts.$portsContainerRight.find('.port').each(function() {
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

    return {
        addMetaName: addMetaName,
        hidePortNames: hidePortNames
    };

});

