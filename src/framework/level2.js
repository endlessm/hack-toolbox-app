/* exported FrameworkLevel2 */

const {GObject, Gtk} = imports.gi;
const Gettext = imports.gettext;

const {PopupMenu} = imports.popupMenu;
const {Section} = imports.section;

GObject.type_ensure(Section.$gtype);

const _ = Gettext.gettext;

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
            normal: _('Normal'),
            flipped: _('Flipped'),
            bubbles: _('Bubbles'),
            scrambled: _('Scrambled'),
            zalgo: _('Zalgo'),
        }, Gtk.Label, 'label', {});

        this._filterGroup = new PopupMenu(this._filterButton, {
            none: _('None'),
            disco: _('Disco'),
            corduroy: _('Corduroy'),
            blueprint: _('Blueprint'),
            lensFlare: _('Lens Flare'),
        }, Gtk.Label, 'label', {});

        this._cipherChooser.connect('output', entry => {
            entry.text = `+${this._cipherAdjustment.value}`;
        });
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        model.bind_property('text-transformation', this._effectGroup, 'value', flags);
        model.bind_property('image-filter', this._filterGroup, 'value', flags);
        model.bind_property('text-cipher', this._cipherAdjustment, 'value', flags);
        model.bind_property('hyperlinks', this._hyperlinksButton, 'active', flags);
        model.bind_property('sounds-cursor-click', this._clickSoundChooser, 'active-id', flags);
        model.bind_property('sounds-cursor-hover', this._hoverSoundChooser, 'active-id', flags);

        this._model = model;
    }
});
