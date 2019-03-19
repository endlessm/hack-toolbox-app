/* exported FrameworkLevel2 */

const {GObject, Gtk} = imports.gi;

const {PopupMenu} = imports.popupMenu;
const {Section} = imports.section;

GObject.type_ensure(Section.$gtype);

var FrameworkLevel2 = GObject.registerClass({
    GTypeName: 'FrameworkLevel2',
    Template: 'resource:///com/endlessm/HackToolbox/framework/level2.ui',
    InternalChildren: ['cipherAdjustment', 'cipherChooser', 'clickSoundChooser',
        'effectButton', 'filterButton', 'hoverSoundChooser',
        'hyperlinksButton'],
}, class FrameworkLevel2 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        this._effectGroup = new PopupMenu(this._effectButton, {
            normal: 'text-transformation-normal-symbolic',
            flipped: 'text-transformation-flipped-symbolic',
            bubbles: 'text-transformation-bubbles-symbolic',
            scrambled: 'text-transformation-scrambled-symbolic',
            creepy: 'text-transformation-creepy-symbolic',
        }, Gtk.Image, 'iconName', {pixelSize: 32});

        this._filterGroup = new PopupMenu(this._filterButton, {
            none: 'image-filter-normal-symbolic',
            disco: 'image-filter-disco-symbolic',
            corduroy: 'image-filter-corduroy-symbolic',
            blueprint: 'image-filter-blueprint-symbolic',
            lensFlare: 'image-filter-lensflare-symbolic',
        }, Gtk.Image, 'iconName', {pixelSize: 32});

        this._cipherChooser.connect('output', entry => {
            entry.text = `+${this._cipherAdjustment.value}`;
        });
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;

        const bindingInfo = [
            ['text-transformation', this._effectGroup, 'value'],
            ['image-filter', this._filterGroup, 'value'],
            ['text-cipher', this._cipherAdjustment, 'value'],
            ['hyperlinks', this._hyperlinksButton, 'active'],
            ['sounds-cursor-click', this._clickSoundChooser, 'active-id'],
            ['sounds-cursor-hover', this._hoverSoundChooser, 'active-id'],
        ];

        this._bindings = bindingInfo.map(([prop, target, targetProp]) =>
            model.bind_property(prop, target, targetProp, flags));

        this._model = model;
    }

    unbindModel() {
        this._model = null;

        if (this._bindings) {
            this._bindings.forEach(binding => binding.unbind());
            this._bindings = null;
        }
    }
});
