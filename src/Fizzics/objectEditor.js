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

        const bindingInfo = [
            [map['radius'], this._adjustmentRadius, 'value', flags],
            [map['gravity'], this._adjustmentGravity, 'value', flags],
            [map['collision'], this._adjustmentBounce, 'value', flags],
            [map['friction'], this._adjustmentFriction, 'value', flags],
            [map['physics'], this._buttonFrozen, 'active', flagsInvert],
            [map['social0'], this._adjustmentSocial0, 'value', flags],
            [map['social1'], this._adjustmentSocial1, 'value', flags],
            [map['social2'], this._adjustmentSocial2, 'value', flags],
            [map['social3'], this._adjustmentSocial3, 'value', flags],
            [map['social4'], this._adjustmentSocial4, 'value', flags],
            [map['badSFX'], this._comboBadSFX, 'active', flags],
            [map['badVFX'], this._comboBadVFX, 'active', flags],
            [map['goodSFX'], this._comboGoodSFX, 'active', flags],
            [map['goodVFX'], this._comboGoodVFX, 'active', flags],
            [map['skin'], this._menuSkin, 'index', flags],
            [map['skin0'], this._imageSkin0, 'index', flags],
            [map['skin1'], this._imageSkin1, 'index', flags],
            [map['skin2'], this._imageSkin2, 'index', flags],
            [map['skin3'], this._imageSkin3, 'index', flags],
            [map['skin4'], this._imageSkin4, 'index', flags],
        ];

        this._bindings = bindingInfo.map(([prop, target, targetProp, bindingFlags]) =>
            model.bind_property(prop, target, targetProp, bindingFlags));
    }

    unbindModel() {
        if (this._bindings) {
            this._bindings.forEach(binding => binding.unbind());
            this._bindings = null;
        }
    }
});
