/* exported RaModel */
/* global pkg */

const {Gdk, Gio, GLib, GObject, HackToolbox} = imports.gi;
const ByteArray = imports.byteArray;

const Gen = imports.framework.gen;
const Utils = imports.framework.utils;

const _PRIO = GLib.PRIORITY_DEFAULT;

const KnowledgeControlIface = `
<node>
  <interface name="com.endlessm.KnowledgeControl">
    <method name="Restart">
      <arg type="a{sh}" name="paths" direction="in"/>
      <arg type="ah" name="gresources" direction="in"/>
      <arg type="ah" name="shards" direction="in"/>
      <arg type="a{sv}" name="options" direction="in"/>
    </method>
  </interface>
</node>
`;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

// FIXME: these are only valid for the dinosaurs app
// FIXME: Determine one source of truth for paramspec defaults, default values,
// and code defaults
const _DEFAULTS = {
    'logo-graphic': 'dinosaur',
    'logo-color': new Gdk.RGBA({red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0}),
    'main-color': new Gdk.RGBA({red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0}),
    'accent-color': new Gdk.RGBA({red: 0.8, green: 0.3255, blue: 0.1686, alpha: 1.0}),
    'info-color': new Gdk.RGBA({red: 0.9569, green: 0.851, blue: 0.3098, alpha: 1.0}),
    font: 'Skranji',
    'font-size': 10,
    'border-width': 0,
    'border-color': new Gdk.RGBA({red: 0.0, green: 0.0, blue: 0.0, alpha: 1.0}),
    'text-transformation': 'normal',
    'card-order': 'ordered',
    'card-layout': 'tiledGrid',
    'image-filter': 'none',
    'sounds-cursor-hover': 'none',
    'sounds-cursor-click': 'none',
    hyperlinks: true,
};

var RaModel = GObject.registerClass({
    Properties: {
        'logo-graphic': GObject.ParamSpec.string('logo-graphic', 'Logo Graphic', '',
            _propFlags, 'dinosaur'),
        'logo-color': GObject.ParamSpec.boxed('logo-color', 'Logo Color', '',
            _propFlags, Gdk.RGBA),
        'main-color': GObject.ParamSpec.boxed('main-color', 'Main Color', '',
            _propFlags, Gdk.RGBA),
        'accent-color': GObject.ParamSpec.boxed('accent-color', 'Accent Color', '',
            _propFlags, Gdk.RGBA),
        'info-color': GObject.ParamSpec.boxed('info-color', 'Info Color', '',
            _propFlags, Gdk.RGBA),
        font: GObject.ParamSpec.string('font', 'Font', '', _propFlags, 'Skranji'),
        'font-size': GObject.ParamSpec.uint('font-size', 'Font Size', '',
            _propFlags, 0, GLib.MAXUINT32, 10),
        'border-width': GObject.ParamSpec.uint('border-width', 'Border Width', '',
            _propFlags, 0, GLib.MAXUINT32, 0),
        'border-color': GObject.ParamSpec.boxed('border-color', 'Border Color', '',
            _propFlags, Gdk.RGBA),
        'text-transformation': GObject.ParamSpec.string('text-transformation',
            'Text Transformation', '', _propFlags, 'normal'),
        'card-order': GObject.ParamSpec.string('card-order', 'Card Order', '',
            _propFlags, 'ordered'),
        'card-layout': GObject.ParamSpec.string('card-layout', 'Card Layout', '',
            _propFlags, 'tiledGrid'),
        'image-filter': GObject.ParamSpec.string('image-filter', 'Image Filter', '',
            _propFlags, 'none'),
        'sounds-cursor-hover': GObject.ParamSpec.string('sounds-cursor-hover',
            'Sounds on Cursor Hover', '',
            _propFlags, 'none'),
        'sounds-cursor-click': GObject.ParamSpec.string('sounds-cursor-click',
            'Sounds on Cursor Click', '',
            _propFlags, 'none'),
        'text-cipher': GObject.ParamSpec.uint('text-cipher', 'Text Cipher', '',
            _propFlags, 0, 25, 0),
        hyperlinks: GObject.ParamSpec.boolean('hyperlinks', 'Hyperlinks', '',
            _propFlags, true),
    },
}, class RaModel extends GObject.Object {
    get logo_graphic() {
        return this._logoGraphic;
    }

    set logo_graphic(value) {
        if ('_logoGraphic' in this && this._logoGraphic === value)
            return;
        this._logoGraphic = value;
        this.notify('logo-graphic');
    }

    get logo_color() {
        return this._logoColor;
    }

    set logo_color(value) {
        if ('_logoColor' in this && this._logoColor === value)
            return;
        this._logoColor = value;
        this.notify('logo-color');
    }

    get main_color() {
        return this._mainColor;
    }

    set main_color(value) {
        if ('_mainColor' in this && this._mainColor === value)
            return;
        this._mainColor = value;
        this.notify('main-color');
    }

    get accent_color() {
        return this._accentColor;
    }

    set accent_color(value) {
        if ('_accentColor' in this && this._accentColor === value)
            return;
        this._accentColor = value;
        this.notify('accent-color');
    }

    get info_color() {
        return this._infoColor;
    }

    set info_color(value) {
        if ('_infoColor' in this && this._infoColor === value)
            return;
        this._infoColor = value;
        this.notify('info-color');
    }

    get font() {
        return this._font;
    }

    set font(value) {
        if ('_font' in this && this._font === value)
            return;
        this._font = value;
        this.notify('font');
    }

    get font_size() {
        return this._fontSize;
    }

    set font_size(value) {
        if ('_fontSize' in this && this._fontSize === value)
            return;
        this._fontSize = value;
        this.notify('font-size');
    }

    get border_width() {
        return this._borderWidth;
    }

    set border_width(value) {
        if ('_borderWidth' in this && this._borderWidth === value)
            return;
        this._borderWidth = value;
        this.notify('border-width');
    }

    get border_color() {
        return this._borderColor;
    }

    set border_color(value) {
        if ('_borderColor' in this && this._borderColor === value)
            return;
        this._borderColor = value;
        this.notify('border-color');
    }

    get text_transformation() {
        return this._textTransformation;
    }

    set text_transformation(value) {
        if ('_textTransformation' in this && this._textTransformation === value)
            return;
        this._textTransformation = value;
        this.notify('text-transformation');
    }

    get card_order() {
        return this._cardOrder;
    }

    set card_order(value) {
        if ('_cardOrder' in this && this._cardOrder === value)
            return;
        this._cardOrder = value;
        this.notify('card-order');
    }

    get card_layout() {
        return this._cardLayout;
    }

    set card_layout(value) {
        if ('_cardLayout' in this && this._cardLayout === value)
            return;
        this._cardLayout = value;
        this.notify('card-layout');
    }

    get image_filter() {
        return this._imageFilter;
    }

    set image_filter(value) {
        if ('_imageFilter' in this && this._imageFilter === value)
            return;
        this._imageFilter = value;
        this.notify('image-filter');
    }

    get sounds_cursor_hover() {
        return this._soundsCursorHover;
    }

    set sounds_cursor_hover(value) {
        if ('_soundsCursorHover' in this && this._soundsCursorHover === value)
            return;
        this._soundsCursorHover = value;
        this.notify('sounds-cursor-hover');

        if (value !== 'none') {
            this._soundsCursorClick = 'none';
            this.notify('sounds-cursor-click');
        }
    }

    get sounds_cursor_click() {
        return this._soundsCursorClick;
    }

    set sounds_cursor_click(value) {
        if ('_soundsCursorClick' in this && this._soundsCursorClick === value)
            return;
        this._soundsCursorClick = value;
        this.notify('sounds-cursor-click');

        if (value !== 'none') {
            this._soundsCursorHover = 'none';
            this.notify('sounds-cursor-hover');
        }
    }

    get text_cipher() {
        return this._textCipher;
    }

    set text_cipher(value) {
        if ('_textCipher' in this && this._textCipher === value)
            return;
        this._textCipher = value;
        this.notify('text-cipher');
    }

    get hyperlinks() {
        return this._hyperlinks;
    }

    set hyperlinks(value) {
        if ('_hyperlinks' in this && this._hyperlinks === value)
            return;
        this._hyperlinks = value;
        this.notify('hyperlinks');
    }

    _createCSS() {
        const scss = Gen.generateSCSS(this);
        return Utils.transformStringToFD(scss,
            ['sassc', '-s', '-I', '/usr/share/eos-knowledge/theme']);
    }

    _createJSON() {
        const yaml = Gen.generateYAML(this);
        return Utils.transformStringToFD(yaml,
            ['autobahn', '-I', '/usr/share/eos-knowledge/preset']);
    }

    async _createGResource() {
        const tmpDir = Gio.File.new_for_path(GLib.get_user_runtime_dir());

        const logoResource = Gio.File.new_for_uri(
            `resource:///com/endlessm/HackToolbox/framework/${this._logoGraphic}.svg`);
        const logo = tmpDir.get_child('logo');
        await logoResource.copy_async(logo, Gio.FileCopyFlags.OVERWRITE, _PRIO,
            null, null);

        const manifest = Gen.generateGResource(this);
        const manifestXml = tmpDir.get_child('hacking.gresource.xml');
        await manifestXml.replace_contents_bytes_async(ByteArray.fromString(manifest),
            null, false, Gio.FileCreateFlags.NONE, null);

        const gresource = tmpDir.get_child('hacking.gresource');
        const proc = new Gio.Subprocess({
            argv: ['glib-compile-resources', '--target', gresource.get_path(),
                '--sourcedir', tmpDir.get_path(), manifestXml.get_path()],
        });
        proc.init(null);
        await proc.wait_check_async(null);

        return HackToolbox.open_fd_readonly(gresource);
    }

    async launch(busName) {
        const css = await this._createCSS();
        const json = await this._createJSON();
        const gresource = await this._createGResource();
        const modules = await Utils.getModulesGResource();
        let soundpack = null;
        let packname;
        if (this.sounds_cursor_hover !== 'none')
            packname = this.sounds_cursor_hover;
        if (this.sounds_cursor_click !== 'none')
            packname = this.sounds_cursor_click;
        if (packname) {
            const pkgdatadir = Gio.File.new_for_path(pkg.pkgdatadir);
            const soundpackResource = pkgdatadir.get_child(`soundpack-${packname}.gresource`);
            soundpack = HackToolbox.open_fd_readonly(soundpackResource);
        }

        const AppProxy = Gio.DBusProxy.makeProxyWrapper(KnowledgeControlIface);

        // Here we need to talk to the framework app itself, instead of its
        // window. In eos-knowledge-lib the path of the app object is equal to
        // the app ID but with slashes instead of dots.
        const appObjectPath = `/${busName.replace(/\./g, '/')}`;
        const app = new AppProxy(Gio.DBus.session, busName, appObjectPath);

        const fdsToPass = [css, json, gresource, modules];
        const gresourceIndices = [2, 3];
        if (soundpack !== null) {
            fdsToPass.push(soundpack);
            gresourceIndices.push(4);
        }

        // Work around the Gio.DBus overrides not supporting Gio.UnixFDList
        // https://gitlab.gnome.org/GNOME/gjs/issues/204
        const fdlist = Gio.UnixFDList.new_from_array(fdsToPass);
        return new Promise((resolve, reject) => {
            Utils.proxyCallWithFDList.call(app, 'Restart', false,
                ['a{sh}', 'ah', 'ah', 'a{sv}'],
                {
                    theme: 0,
                    ui: 1,
                },
                gresourceIndices, [], {}, fdlist,
                (out, err) => {
                    if (err)
                        reject(err);
                    else
                        resolve(out);
                });
        });
    }

    reset() {
        Object.entries(_DEFAULTS).forEach(([prop, value]) => {
            this[prop.replace(/-/g, '_')] = value;
        });
    }
});

RaModel.CODE_DEFAULTS = {
    logo_graphic: "'dinosaur'",
    logo_color: "'white'",
    main_color: "'white'",
    accent_color: "'rgb(204,83,43)'",
    info_color: "'rgb(244,217,79)'",
    font: "'Skranji'",
    font_size: '10',
    border_width: '0',
    border_color: "'black'",
    text_transformation: "'normal'",
    card_order: "'ordered'",
    card_layout: "'tiledGrid'",
    image_filter: "'none'",
    sounds_cursor_hover: "'none'",
    sounds_cursor_click: "'none'",
    hyperlinks: 'yes',
};

// FIXME This should turn into a function that provides available fonts in each
// flatpak app's sandbox, possibly hardcoded
RaModel.FONT_LIST = [
    'Fira Sans',
    'HammersmithOne',
    'Lato',
    'Marcellus SC',
    'Pathway Gothic One',
    'Podkova',
    'Raleway',
    'Skranji',
];
