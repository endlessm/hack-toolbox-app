/* exported HBObjectEditor */

const {GObject, Gtk} = imports.gi;
const {HBSkinImage, HBSkinMaxIndex} = imports.hackyballs.skinImage;

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
        'choicesSkin',
        'imageObject0',
        'imageObject1',
        'imageObject2',
        'menuSkin',
    ],
}, class HBObjectEditor extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        const indexes = Array(HBSkinMaxIndex + 1).fill();
        indexes.forEach((value, index) => {
            const widget = new HBSkinImage({index: index, visible: true});
            this._choicesSkin.add(widget);
        });

        this._imageSkin = new HBSkinImage({visible: true});
        this._buttonSkin.add(this._imageSkin);
        this._choicesSkin.connect('child-activated',
            this._onChoicesActivated.bind(this));

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
        model.bind_property(map['skin'], this._imageSkin, 'index', flags);
        model.bind_property(map['skin0'], this._imageSkin0, 'index', flags);
        model.bind_property(map['skin1'], this._imageSkin1, 'index', flags);
        model.bind_property(map['skin2'], this._imageSkin2, 'index', flags);
    }

    _onChoicesActivated(widget, child) {
        const choice = child.get_child();
        this._imageSkin.index = choice.index;
        this._menuSkin.popdown();
    }
});
