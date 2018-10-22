/* exported FrameworkLevel1 */

const {GObject, Gtk} = imports.gi;
const Gettext = imports.gettext;

const {logoIDToResource, LogoImage, VALID_LOGOS} = imports.framework.logoImage;
const {PopupMenu} = imports.popupMenu;

const _ = Gettext.gettext;

var FrameworkLevel1 = GObject.registerClass({
    GTypeName: 'FrameworkLevel1',
    Template: 'resource:///com/endlessm/HackToolbox/framework/level1.ui',
    Children: ['leftInnerGrid', 'rightInnerGrid'],
    InternalChildren: ['accentColorButton', 'borderColorButton',
        'borderWidthAdjustment', 'clickSoundChooser', 'fontChooser',
        'fontRenderer', 'fontSizeAdjustment', 'hoverSoundChooser',
        'infoColorButton', 'layoutButton', 'logoButton', 'logoColorButton',
        'mainColorButton', 'orderButton'],
}, class FrameworkLevel1 extends Gtk.Grid {
    _init(defaults, props = {}) {
        super._init(props);

        const fontList = Gtk.ListStore.new([GObject.TYPE_STRING]);
        defaults.fonts.forEach(fontFamily => {
            const iter = fontList.append();
            fontList.set(iter, [0], [fontFamily]);
        });
        this._fontChooser.model = fontList;
        this._fontChooser.idColumn = 0;
        this._fontChooser.add_attribute(this._fontRenderer, 'text', 0);
        this._fontChooser.add_attribute(this._fontRenderer, 'family', 0);

        this._layoutGroup = new PopupMenu(this._layoutButton, {
            tiledGrid: 'tiled-grid-symbolic',
            windshield: 'windshield-symbolic',
            piano: 'piano-symbolic',
            nest: 'nest-symbolic',
            overflow: 'overflow-symbolic',
        }, Gtk.Image, 'iconName', {pixelSize: 50});

        const logoChoices = {};
        VALID_LOGOS.forEach(name => {
            logoChoices[name] = logoIDToResource(name);
        });
        this._logoGroup = new PopupMenu(this._logoButton, logoChoices,
            LogoImage, 'resource', {});
        this._logoGroup.value = 'dinosaur';

        this._orderGroup = new PopupMenu(this._orderButton, {
            ordered: _('Ordered'),
            random: _('Random'),
            az: _('A–Z'),
            za: _('Z–A'),
        }, Gtk.Label, 'label', {});
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL;
        model.bind_property('accent-color', this._accentColorButton, 'rgba', flags);
        model.bind_property('border-color', this._borderColorButton, 'rgba', flags);
        model.bind_property('border-width', this._borderWidthAdjustment, 'value', flags);
        model.bind_property('card-layout', this._layoutGroup, 'value', flags);
        model.bind_property('card-order', this._orderGroup, 'value', flags);
        model.bind_property('font', this._fontChooser, 'active-id',
            flags | GObject.BindingFlags.SYNC_CREATE);
        model.bind_property('font-size', this._fontSizeAdjustment, 'value', flags);
        model.bind_property('info-color', this._infoColorButton, 'rgba', flags);
        model.bind_property('logo-color', this._logoColorButton, 'rgba', flags);
        model.bind_property('logo-graphic', this._logoGroup, 'value', flags);
        model.bind_property('main-color', this._mainColorButton, 'rgba', flags);
        model.bind_property('sounds-cursor-click', this._clickSoundChooser, 'active-id', flags);
        model.bind_property('sounds-cursor-hover', this._hoverSoundChooser, 'active-id', flags);

        this._model = model;
    }
});
