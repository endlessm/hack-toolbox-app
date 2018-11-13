/* exported FizzicsObjectEditor */

const {GObject, Gtk} = imports.gi;
const {FizzicsSkinImage, FizzicsSkinMaxIndex} = imports.Fizzics.skinImage;
const {PopupMenu} = imports.popupMenu;
const {VFX_BAD, VFX_GOOD, SFX_BAD, SFX_GOOD} = imports.Fizzics.model;

var FizzicsObjectEditor = GObject.registerClass({
    GTypeName: 'FizzicsObjectEditor',
    Template: 'resource:///com/endlessm/HackToolbox/Fizzics/objectEditor.ui',
    InternalChildren: [
        'adjustmentRadius',
        'adjustmentGravity',
        'adjustmentBounce',
        'adjustmentDrag',
        'adjustmentSocial0',
        'adjustmentSocial1',
        'adjustmentSocial2',
        'adjustmentSocial3',
        'adjustmentSocial4',
        'buttonLock',
        'buttonSkin',
        'comboBadSFX',
        'comboBadVFX',
        'comboGoodSFX',
        'comboGoodVFX',
        'imageObject0',
        'imageObject1',
        'imageObject2',
        'imageObject3',
        'imageObject4',
    ],
}, class FizzicsObjectEditor extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        const indices = Array.from({length: FizzicsSkinMaxIndex + 1}, (v, i) => i);
        this._menuSkin = new PopupMenu(this._buttonSkin, indices, FizzicsSkinImage,
            'index', {});

        SFX_BAD.forEach((value, index) => {
            this._comboBadSFX.append(`${index}`, value);
        });
        VFX_BAD.forEach((value, index) => {
            this._comboBadVFX.append(`${index}`, value);
        });
        SFX_GOOD.forEach((value, index) => {
            this._comboGoodSFX.append(`${index}`, value);
        });
        VFX_GOOD.forEach((value, index) => {
            this._comboGoodVFX.append(`${index}`, value);
        });

        this._imageSkin0 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._imageObject0.add(this._imageSkin0);
        this._imageSkin1 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._imageObject1.add(this._imageSkin1);
        this._imageSkin2 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._imageObject2.add(this._imageSkin2);
        this._imageSkin3 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._imageObject3.add(this._imageSkin3);
        this._imageSkin4 = new FizzicsSkinImage({visible: true, pixels: 32});
        this._imageObject4.add(this._imageSkin4);
    }

    bindModel(model, map) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        const flagsInvert = flags | GObject.BindingFlags.INVERT_BOOLEAN;
        model.bind_property(map['radius'], this._adjustmentRadius, 'value', flags);
        model.bind_property(map['gravity'], this._adjustmentGravity, 'value', flags);
        model.bind_property(map['collision'], this._adjustmentBounce, 'value', flags);
        model.bind_property(map['friction'], this._adjustmentDrag, 'value', flags);
        model.bind_property(map['physics'], this._buttonLock, 'active', flagsInvert);
        model.bind_property(map['social0'], this._adjustmentSocial0, 'value', flags);
        model.bind_property(map['social1'], this._adjustmentSocial1, 'value', flags);
        model.bind_property(map['social2'], this._adjustmentSocial2, 'value', flags);
        model.bind_property(map['social3'], this._adjustmentSocial3, 'value', flags);
        model.bind_property(map['social4'], this._adjustmentSocial4, 'value', flags);
        model.bind_property(map['badSFX'], this._comboBadSFX, 'active', flags);
        model.bind_property(map['badVFX'], this._comboBadVFX, 'active', flags);
        model.bind_property(map['goodSFX'], this._comboGoodSFX, 'active', flags);
        model.bind_property(map['goodVFX'], this._comboGoodVFX, 'active', flags);
        model.bind_property(map['skin'], this._menuSkin, 'index', flags);
        model.bind_property(map['skin0'], this._imageSkin0, 'index', flags);
        model.bind_property(map['skin1'], this._imageSkin1, 'index', flags);
        model.bind_property(map['skin2'], this._imageSkin2, 'index', flags);
        model.bind_property(map['skin3'], this._imageSkin3, 'index', flags);
        model.bind_property(map['skin4'], this._imageSkin4, 'index', flags);
    }
});
