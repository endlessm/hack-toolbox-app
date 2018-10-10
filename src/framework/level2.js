/* exported FrameworkLevel2 */

const {GObject, Gtk} = imports.gi;
const Gettext = imports.gettext;

const {PopupMenu} = imports.popupMenu;

const _ = Gettext.gettext;

var FrameworkLevel2 = GObject.registerClass({
    GTypeName: 'FrameworkLevel2',
    Template: 'resource:///com/endlessm/HackToolbox/framework/level2.ui',
    Children: ['leftInnerGrid', 'rightInnerGrid'],
    InternalChildren: ['cipherAdjustment', 'cipherSlider', 'effectButton',
        'filterButton'],
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

        this._cipherSlider.connect('format-value', (scale, value) =>
            `A→${String.fromCharCode(value + 'A'.charCodeAt())}`);

        // temporarily hide widgets that don't correspond to model properties
        this.rightInnerGrid.get_child_at(0, 1).hide();
        this.rightInnerGrid.get_child_at(1, 1).hide();
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL;
        model.bind_property('text-transformation', this._effectGroup, 'value', flags);
        model.bind_property('image-filter', this._filterGroup, 'value', flags);
        model.bind_property('text-cipher', this._cipherAdjustment, 'value', flags);

        this._model = model;
    }
});
