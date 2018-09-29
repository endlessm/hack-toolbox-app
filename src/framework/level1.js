/* exported FrameworkLevel1 */

const {GObject, Gtk} = imports.gi;
const {logoIDToResource, LogoImage, VALID_LOGOS} = imports.framework.logoImage;

var FrameworkLevel1 = GObject.registerClass({
    GTypeName: 'FrameworkLevel1',
    Template: 'resource:///com/endlessm/HackToolbox/framework/level1.ui',
    InternalChildren: ['accentColorButton', 'fontButton', 'fontSizeAdjustment',
        'infoColorButton', 'logoButton', 'logoChoices', 'logoColorButton',
        'logoMenu', 'mainColorButton'],
}, class FrameworkLevel1 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        VALID_LOGOS.forEach(name => {
            const resource = logoIDToResource(name);
            const widget = new LogoImage({resource, visible: true});
            this._logoChoices.add(widget);
        });
        this._logoImage = new LogoImage({
            resource: '/com/endlessm/HackToolbox/framework/dinosaur.svg',
            visible: true,
        });
        this._logoButton.add(this._logoImage);

        this._logoChoices.connect('child-activated',
            this._onLogoChoicesActivated.bind(this));
    }

    bindModel(model) {
        // Sync some properties from the target to the source, to begin with.
        // The default value of a Gdk.RGBA GObject property is null.
        model.accent_color = this._accentColorButton.rgba;
        model.info_color = this._infoColorButton.rgba;
        model.logo_color = this._logoColorButton.rgba;
        model.main_color = this._mainColorButton.rgba;
        model.font = this._fontButton.font_desc;

        const flags = GObject.BindingFlags.BIDIRECTIONAL;
        model.bind_property('accent-color', this._accentColorButton, 'rgba', flags);
        model.bind_property('font', this._fontButton, 'font-desc', flags);
        model.bind_property('font-size', this._fontSizeAdjustment, 'value', flags);
        model.bind_property('info-color', this._infoColorButton, 'rgba', flags);
        model.bind_property('logo-color', this._logoColorButton, 'rgba', flags);
        model.bind_property('logo-graphic', this._logoImage, 'resource', flags);
        model.bind_property('main-color', this._mainColorButton, 'rgba', flags);

        this._model = model;
    }

    _onLogoChoicesActivated(widget, child) {
        const choice = child.get_child();  // child of the FlowBoxChild
        this._logoImage.resource = choice.resource;
        this._logoMenu.popdown();
    }
});
