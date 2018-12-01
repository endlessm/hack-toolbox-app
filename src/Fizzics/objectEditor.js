/* exported FizzicsObjectEditor */

const {GObject, Gtk, Pango} = imports.gi;
const {FizzicsSkinImage} = imports.Fizzics.skinImage;
const {PopupMenu} = imports.popupMenu;
const {SKINS, VFXS, SFXS} = imports.Fizzics.model;

var FizzicsObjectEditor = GObject.registerClass({
    GTypeName: 'FizzicsObjectEditor',
    Template: 'resource:///com/endlessm/HackToolbox/Fizzics/objectEditor.ui',
    InternalChildren: [
        'adjustmentRadius',
        'adjustmentGravity',
        'adjustmentBounce',
        'adjustmentFriction',
        'adjustmentSocial0',
        'adjustmentSocial1',
        'adjustmentSocial2',
        'adjustmentSocial3',
        'adjustmentSocial4',
        'buttonFrozen',
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
        'scaleSocial0',
        'scaleSocial1',
        'scaleSocial2',
        'scaleSocial3',
        'scaleSocial4',
    ],
}, class FizzicsObjectEditor extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        const indices = Array.from({length: SKINS.length}, (v, i) => i);
        this._menuSkin = new PopupMenu(this._buttonSkin, indices, FizzicsSkinImage,
            'index', {});

        this._populateCombo(this._comboBadSFX, SFXS);
        this._populateCombo(this._comboBadVFX, VFXS);
        this._populateCombo(this._comboGoodSFX, SFXS);
        this._populateCombo(this._comboGoodVFX, VFXS);

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

        for (let ix = 0; ix < 5; ix++) {
            const scale = this[`_scaleSocial${ix}`];
            scale.add_mark(0.0, Gtk.PositionType.TOP, null);
            scale.add_mark(0.0, Gtk.PositionType.BOTTOM, null);
        }
    }

    _populateCombo(combo, options) {
        void this;
        const store = new Gtk.ListStore();
        store.set_column_types([GObject.TYPE_STRING]);
        options.forEach(value => {
            store.set(store.append(), [0], [value]);
        });

        const renderer = new Gtk.CellRendererText({
            ellipsize: Pango.EllipsizeMode.END,
        });
        renderer.set_fixed_size(100, -1);

        combo.set_model(store);
        combo.pack_start(renderer, true);
        combo.add_attribute(renderer, 'text', 0);
    }

    bindModel(model, map) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        const flagsInvert = flags | GObject.BindingFlags.INVERT_BOOLEAN;
        model.bind_property(map['radius'], this._adjustmentRadius, 'value', flags);
        model.bind_property(map['gravity'], this._adjustmentGravity, 'value', flags);
        model.bind_property(map['collision'], this._adjustmentBounce, 'value', flags);
        model.bind_property(map['friction'], this._adjustmentFriction, 'value', flags);
        model.bind_property(map['physics'], this._buttonFrozen, 'active', flagsInvert);
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
