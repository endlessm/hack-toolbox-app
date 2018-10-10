/* exported HBLevel1 */

const {GObject, Gtk} = imports.gi;

const {ButtonGroup} = imports.framework.buttonGroup;
const {HBSkinImage} = imports.hackyballs.skinImage;
const {HBObjectEditor} = imports.hackyballs.objectEditor;

var HBLevel1 = GObject.registerClass({
    GTypeName: 'HBLevel1',
    Template: 'resource:///com/endlessm/HackToolbox/hackyballs/level1.ui',
    InternalChildren: [
        'buttonBackground0',
        'buttonBackground1',
        'buttonBackground2',
        'tab0',
        'tab0Image',
        'tab1',
        'tab1Image',
        'tab2',
        'tab2Image',
    ],
}, class HBLevel1 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);
        this._backgroundGroup = new ButtonGroup({
            buttonBackground0: this._buttonBackground0,
            buttonBackground1: this._buttonBackground1,
            buttonBackground2: this._buttonBackground2,
        });

        this._editor0 = new HBObjectEditor({visible: true});
        this._image0 = new HBSkinImage({visible: true, pixels: 32});
        this._tab0.add(this._editor0);
        this._tab0Image.add(this._image0);

        this._editor1 = new HBObjectEditor({visible: true});
        this._image1 = new HBSkinImage({visible: true, pixels: 32});
        this._tab1.add(this._editor1);
        this._tab1Image.add(this._image1);

        this._editor2 = new HBObjectEditor({visible: true});
        this._image2 = new HBSkinImage({visible: true, pixels: 32});
        this._tab2.add(this._editor2);
        this._tab2Image.add(this._image2);
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        model.bind_property('backgroundImageIndex', this._backgroundGroup, 'index', flags);
        model.bind_property('imageIndex0', this._image0, 'index', flags);
        model.bind_property('imageIndex1', this._image1, 'index', flags);
        model.bind_property('imageIndex2', this._image2, 'index', flags);

        this._editor0.bindModel(
            model, {
                radius: 'radius0',
                gravity: 'gravity0',
                collision: 'collision0',
                friction: 'friction0',
                physics: 'usePhysics0',
                social0: 'socialForce00',
                social1: 'socialForce01',
                social2: 'socialForce02',
                skin: 'imageIndex0',
                skin0: 'imageIndex0',
                skin1: 'imageIndex1',
                skin2: 'imageIndex2',
            }
        );
        this._editor1.bindModel(
            model, {
                radius: 'radius1',
                gravity: 'gravity1',
                collision: 'collision1',
                friction: 'friction1',
                physics: 'usePhysics1',
                social0: 'socialForce10',
                social1: 'socialForce11',
                social2: 'socialForce12',
                skin: 'imageIndex1',
                skin0: 'imageIndex0',
                skin1: 'imageIndex1',
                skin2: 'imageIndex2',
            }
        );
        this._editor2.bindModel(
            model, {
                radius: 'radius2',
                gravity: 'gravity2',
                collision: 'collision2',
                friction: 'friction2',
                physics: 'usePhysics2',
                social0: 'socialForce20',
                social1: 'socialForce21',
                social2: 'socialForce22',
                skin: 'imageIndex2',
                skin0: 'imageIndex0',
                skin1: 'imageIndex1',
                skin2: 'imageIndex2',
            }
        );
    }
});
