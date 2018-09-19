/* exported RaModel */

const {Gdk, Gio, GLib, GObject, Pango} = imports.gi;
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
        'card-borders': GObject.ParamSpec.uint('card-borders', 'Card Borders', '',
            _propFlags, 0, GLib.MAXUINT32, 0),
        'border-color': GObject.ParamSpec.boxed('border-color', 'Border Color', '',
            _propFlags, Gdk.RGBA),
        text: GObject.ParamSpec.string('text', 'Text', '', _propFlags, 'normal'),
        order: GObject.ParamSpec.string('order', 'Order', '', _propFlags, 'ordered'),
        layout: GObject.ParamSpec.string('layout', 'Layout', '', _propFlags, 'tiledGrid'),
        filter: GObject.ParamSpec.string('filter', 'Filter', '', _propFlags, 'none'),
        'hover-sound': GObject.ParamSpec.string('hover-sound', 'Hover Sound', '',
            _propFlags, 'none'),
        'click-sound': GObject.ParamSpec.string('click-sound', 'Click Sound', '',
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

    get card_borders() {
        return this._cardBorders;
    }

    set card_borders(value) {
        if ('_cardBorders' in this && this._cardBorders === value)
            return;
        this._cardBorders = value;
        this.notify('card-borders');
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

    get text() {
        return this._text;
    }

    set text(value) {
        if ('_text' in this && this._text === value)
            return;
        this._text = value;
        this.notify('text');
    }

    get order() {
        return this._order;
    }

    set order(value) {
        if ('_order' in this && this._order === value)
            return;
        this._order = value;
        this.notify('order');
    }

    get layout() {
        return this._layout;
    }

    set layout(value) {
        if ('_layout' in this && this._layout === value)
            return;
        this._layout = value;
        this.notify('layout');
    }

    get filter() {
        return this._filter;
    }

    set filter(value) {
        if ('_filter' in this && this._filter === value)
            return;
        this._filter = value;
        this.notify('filter');
    }

    get hover_sound() {
        return this._hoverSound;
    }

    set hover_sound(value) {
        if ('_hoverSound' in this && this._hoverSound === value)
            return;
        this._hoverSound = value;
        this.notify('hover-sound');

        if (value !== 'none') {
            this._clickSound = 'none';
            this.notify('click-sound');
        }
    }

    get click_sound() {
        return this._clickSound;
    }

    set click_sound(value) {
        if ('_clickSound' in this && this._clickSound === value)
            return;
        this._clickSound = value;
        this.notify('click-sound');

        if (value !== 'none') {
            this._hoverSound = 'none';
            this.notify('hover-sound');
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

        // Ah, geez, this is terrible
        return Utils.transformStringToFD('', ['cat', gresource.get_path()]);
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
