/* exported FrameworkLevel1 */

const {GObject, Gtk} = imports.gi;
const {logoIDToResource, LogoImage, VALID_LOGOS} = imports.framework.logoImage;
const {PopupMenu} = imports.popupMenu;

var FrameworkLevel1 = GObject.registerClass({
    GTypeName: 'FrameworkLevel1',
    Template: 'resource:///com/endlessm/HackToolbox/framework/level1.ui',
    InternalChildren: ['accentColorButton', 'fontButton', 'fontSizeAdjustment',
        'infoColorButton', 'logoButton', 'logoColorButton', 'mainColorButton'],
}, class FrameworkLevel1 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        const logoChoices = {};
        VALID_LOGOS.forEach(name => {
            logoChoices[name] = logoIDToResource(name);
        });
        this._logoGroup = new PopupMenu(this._logoButton, logoChoices,
            LogoImage, 'resource', {});
        this._logoGroup.value = 'dinosaur';
    }

    bindModel(model) {
        // Sync some properties from the target to the source, to begin with.
        // The default value of a Gdk.RGBA GObject property is null.
        model.accent_color = this._accentColorButton.rgba;
        model.info_color = this._infoColorButton.rgba;
        model.logo_color = this._logoColorButton.rgba;
        model.logo_graphic = this._logoGroup.value;
        model.main_color = this._mainColorButton.rgba;
        model.font = this._fontButton.font_desc;

        const flags = GObject.BindingFlags.BIDIRECTIONAL;
        model.bind_property('accent-color', this._accentColorButton, 'rgba', flags);
        model.bind_property('font', this._fontButton, 'font-desc', flags);
        model.bind_property('font-size', this._fontSizeAdjustment, 'value', flags);
        model.bind_property('info-color', this._infoColorButton, 'rgba', flags);
        model.bind_property('logo-color', this._logoColorButton, 'rgba', flags);
        model.bind_property('logo-graphic', this._logoGroup, 'value', flags);
        model.bind_property('main-color', this._mainColorButton, 'rgba', flags);

        this._model = model;
    }
});
