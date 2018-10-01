/* exported RaModel */

const {Gdk, Gio, GLib, GObject, HackToolbox, Pango} = imports.gi;
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

var RaModel = GObject.registerClass({
    Properties: {
        'logo-graphic': GObject.ParamSpec.string('logo-graphic', 'Logo Graphic', '',
            _propFlags, '/com/endlessm/HackToolbox/framework/dinosaur.svg'),
        'logo-color': GObject.ParamSpec.boxed('logo-color', 'Logo Color', '',
            _propFlags, Gdk.RGBA),
        'main-color': GObject.ParamSpec.boxed('main-color', 'Main Color', '',
            _propFlags, Gdk.RGBA),
        'accent-color': GObject.ParamSpec.boxed('accent-color', 'Accent Color', '',
            _propFlags, Gdk.RGBA),
        'info-color': GObject.ParamSpec.boxed('info-color', 'Info Color', '',
            _propFlags, Gdk.RGBA),
        font: GObject.ParamSpec.boxed('font', 'Font', '', _propFlags,
            Pango.FontDescription),
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

        const logoResource = Gio.File.new_for_uri(`resource://${this._logoGraphic}`);
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

        const AppProxy = Gio.DBusProxy.makeProxyWrapper(KnowledgeControlIface);

        // Here we need to talk to the framework app itself, instead of its
        // window. In eos-knowledge-lib the path of the app object is equal to
        // the app ID but with slashes instead of dots.
        const appObjectPath = `/${busName.replace(/\./g, '/')}`;
        const app = new AppProxy(Gio.DBus.session, busName, appObjectPath);

        // Work around the Gio.DBus overrides not supporting Gio.UnixFDList
        // https://gitlab.gnome.org/GNOME/gjs/issues/204
        const fdlist = Gio.UnixFDList.new_from_array([
            css,
            json,
            gresource,
            modules,
        ]);
        return new Promise((resolve, reject) => {
            Utils.proxyCallWithFDList.call(app, 'Restart', false,
                ['a{sh}', 'ah', 'ah', 'a{sv}'],
                {
                    theme: 0,
                    ui: 1,
                },
                [2, 3],
                [], {}, fdlist,
                (out, err) => {
                    if (err)
                        reject(err);
                    else
                        resolve(out);
                });
        });
    }
});
