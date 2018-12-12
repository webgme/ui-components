# UI-Components
A collection of domain independent webgme components. To use these make sure that you have installed [webgme-cli](https://github.com/webgme/webgme-cli) and that your repository was initialized with `webgme init`.

### Visualizers
#### ICore
ICore now has its own repository at [webgme/icore](https://github.com/webgme/icore)!

#### ModelManager
Configurable, domain-specific, easy-to-use model management visualizer. It allows the creation, deletion
and import/export of models.

- Import using the webgme-cli tool `webgme import viz ModelManager webgme/ui-components`
- Register visualizer at nodes where it should be available.
- Modify and add the following to your [component-settings](https://github.com/webgme/webgme/wiki/Component-Settings).

```
{...
    "ModelManager": {
        "container": "pathOfTheContainer",
        "types": ["MetaTypeName1", "MetaTypeName2"]
    }
...}
```
- `container` - The node from which the visualizer will act. The children of the container will be listed and any new models created from the visualizer will be created inside the container.
- `types` - These need to be valid meta node names. Only children of the container matching these types will be displayed. Note that the meta-type must match exactly (no inheritance taken into account).

![ModelManager](images/modelmanager.png "ModelManager - quick access to your models in your project!")

#### IFrameViz
This is simple example of how to embed another web-site as an iframe inside a webgme visualizer.

The visualizer can be used as is, by default it looks for a url at the `url` attribute of the active-node.
The attribute name can be configured in `components.json`:
```
{...
    "IFrameViz": {
        "urlAttribute": "url"
    }
...}
```

(If the attribute isn't defined or has an empty value an info box will be displayed.)

Keep in mind that you might run into Cross Origin issues unless you setup
a reverse proxy where webgme and the embedded app are reachable from the same host.

### Decorators
#### DisplayMetaDecorator
Inherits the functionality of ModelDecorator but also displays the meta-type of the object and ports.

- Import using the webgme-cli tool `webgme import decorator DisplayMetaDecorator webgme/ui-components`
- At root-node add to `validDecorators` under meta in property editor.
- At nodes where it should be used select it in `decorator` under preferences in property editor.

![DisplayMeta](images/displaymeta.png "ModelDecorator (lhs) compared with DisplayMetaDecorator (rhs) (hovering a port)")

### Plugins
#### ImportModels
Example plugin for using the ModelImport API but with custom matching of bases. The [Import Models Plugin](src/plugins/ImportModels/ImportModels.js) can be imported using webgme-cli, however it is meant to be used as a template for writing a similar plugin with own matching rules.

