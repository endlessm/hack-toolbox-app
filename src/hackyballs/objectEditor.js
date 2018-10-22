/* exported HBObjectEditor */

const {GObject, Gtk} = imports.gi;
const {HBSkinImage, HBSkinMaxIndex} = imports.hackyballs.skinImage;
const {PopupMenu} = imports.popupMenu;

var HBObjectEditor = GObject.registerClass({
    GTypeName: 'HBObjectEditor',
    Template: 'resource:///com/endlessm/HackToolbox/hackyballs/objectEditor.ui',
    InternalChildren: [
        'adjustmentRadius',
        'adjustmentGravity',
        'adjustmentCollision',
        'adjustmentFriction',
        'adjustmentSocial0',
        'adjustmentSocial1',
        'adjustmentSocial2',
        'buttonPhysics',
        'buttonSkin',
        'imageObject0',
        'imageObject1',
        'imageObject2',
    ],
}, class HBObjectEditor extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        const indices = Array.from({length: HBSkinMaxIndex + 1}, (v, i) => i);
        this._menuSkin = new PopupMenu(this._buttonSkin, indices, HBSkinImage,
            'index', {});

        this._imageSkin0 = new HBSkinImage({visible: true, pixels: 32});
        this._imageObject0.add(this._imageSkin0);
        this._imageSkin1 = new HBSkinImage({visible: true, pixels: 32});
        this._imageObject1.add(this._imageSkin1);
        this._imageSkin2 = new HBSkinImage({visible: true, pixels: 32});
        this._imageObject2.add(this._imageSkin2);
    }

    bindModel(model, map) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        model.bind_property(map['radius'], this._adjustmentRadius, 'value', flags);
        model.bind_property(map['gravity'], this._adjustmentGravity, 'value', flags);
        model.bind_property(map['collision'], this._adjustmentCollision, 'value', flags);
        model.bind_property(map['friction'], this._adjustmentFriction, 'value', flags);
        model.bind_property(map['physics'], this._buttonPhysics, 'active', flags);
        model.bind_property(map['social0'], this._adjustmentSocial0, 'value', flags);
        model.bind_property(map['social1'], this._adjustmentSocial1, 'value', flags);
        model.bind_property(map['social2'], this._adjustmentSocial2, 'value', flags);
        model.bind_property(map['skin'], this._menuSkin, 'index', flags);
        model.bind_property(map['skin0'], this._imageSkin0, 'index', flags);
        model.bind_property(map['skin1'], this._imageSkin1, 'index', flags);
        model.bind_property(map['skin2'], this._imageSkin2, 'index', flags);
    }
});
