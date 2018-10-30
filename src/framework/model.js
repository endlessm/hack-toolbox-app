/* exported ensureModelClass */
/* global pkg */

const {Gdk, Gio, GLib, GObject, HackToolbox} = imports.gi;
const ByteArray = imports.byteArray;

const GameState = imports.gameState;
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

const HACKABLE_PROPERTIES = ['logo-graphic', 'logo-color', 'main-color',
    'accent-color', 'font', 'font-size', 'border-width', 'border-color',
    'text-transformation', 'card-order', 'card-layout', 'image-filter',
    'sounds-cursor-hover', 'sounds-cursor-click', 'text-cipher', 'hyperlinks'];

const _createdClasses = new Map();

class RaModelBase extends GObject.Object {
    _init(props = {}) {
        super._init(props);

        // Sync some properties to begin with.
        // The default value of a Gdk.RGBA GObject property is null.
        const defaults = this.constructor._defaults;
        this.accent_color = defaults.value('accent-color');
        this.border_color = defaults.value('border-color');
        this.info_color = defaults.value('info-color');
        this.logo_color = defaults.value('logo-color');
        this.main_color = defaults.value('main-color');

        this.connect('notify', (obj, pspec) => {
            if (pspec.name === 'changed' || this.changed)
                return;
            this._changed = true;
            this.notify('changed');
        });
    }

    get changed() {
        return !!this._changed;
    }

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

    async _checkQuestStatus() {
        // Check hackdex chapter 1 quest
        if (this.constructor.busName === 'com.endlessm.Hackdex_chapter_one') {
            const gameState = GameState.getDefault();
            const key = 'app.com_endlessm_Hackdex_chapter_one.corruption';
            let corruption;
            try {
                corruption = (await gameState.Get(key)).deep_unpack();
            } catch (e) {
                void e;
                return;  // key not yet present, nothing to do
            }
            const corruptedColor = new Gdk.RGBA({red: 1.0, green: 1.0, blue: 1.0, alpha: 0});
            const state = corruption.state.deep_unpack();
            if (state === 'corrupted' && !this.main_color.equal(corruptedColor) ||
                state === 'fixed') {
                // Quest was solved, player set main color to another color; or
                // quest was already solved and we just update the stored color
                await gameState.Set(key, new GLib.Variant('a{ss}', {
                    state: 'fixed',
                    color: Utils.rgbaToString(this.main_color),
                }));
            }
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
            ['autobahn', '-I', '/usr/share/eos-knowledge/preset', '-I',
                '/app/share/com.endlessm.HackToolbox/app-descriptions']);
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
        this.snapshot();  // now, "changed" is relative to this snapshot

        await this._checkQuestStatus();

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
        HACKABLE_PROPERTIES.forEach(prop => {
            this[prop.replace(/-/g, '_')] = this.constructor._defaults.value(prop);
        });
    }

    snapshot() {
        this._changed = false;
        this.notify('changed');
    }
}

function ensureModelClass(busName, defaults) {
    if (_createdClasses.has(busName))
        return _createdClasses.get(busName);

    const ModelClass = GObject.registerClass({
        GTypeName: `RaModel_for_${busName.replace(/./g, '_')}`,
        Properties: {
            changed: GObject.ParamSpec.boolean('changed', 'Changed', '',
                GObject.ParamFlags.READABLE, false),

            'logo-graphic': GObject.ParamSpec.string('logo-graphic', 'Logo Graphic', '',
                _propFlags, defaults.value('logo-graphic')),
            'logo-color': GObject.ParamSpec.boxed('logo-color', 'Logo Color', '',
                _propFlags, Gdk.RGBA),
            'main-color': GObject.ParamSpec.boxed('main-color', 'Main Color', '',
                _propFlags, Gdk.RGBA),
            'accent-color': GObject.ParamSpec.boxed('accent-color', 'Accent Color', '',
                _propFlags, Gdk.RGBA),
            'info-color': GObject.ParamSpec.boxed('info-color', 'Info Color', '',
                _propFlags, Gdk.RGBA),
            font: GObject.ParamSpec.string('font', 'Font', '',
                _propFlags, defaults.value('font')),
            'font-size': GObject.ParamSpec.uint('font-size', 'Font Size', '',
                _propFlags, 0, GLib.MAXUINT32, defaults.value('font-size')),
            'border-width': GObject.ParamSpec.uint('border-width', 'Border Width', '',
                _propFlags, 0, GLib.MAXUINT32, defaults.value('border-width')),
            'border-color': GObject.ParamSpec.boxed('border-color', 'Border Color', '',
                _propFlags, Gdk.RGBA),
            'text-transformation': GObject.ParamSpec.string('text-transformation',
                'Text Transformation', '', _propFlags,
                defaults.value('text-transformation')),
            'card-order': GObject.ParamSpec.string('card-order', 'Card Order', '',
                _propFlags, defaults.value('card-order')),
            'card-layout': GObject.ParamSpec.string('card-layout', 'Card Layout', '',
                _propFlags, defaults.value('card-layout')),
            'image-filter': GObject.ParamSpec.string('image-filter', 'Image Filter', '',
                _propFlags, defaults.value('image-filter')),
            'sounds-cursor-hover': GObject.ParamSpec.string('sounds-cursor-hover',
                'Sounds on Cursor Hover', '',
                _propFlags, defaults.value('sounds-cursor-hover')),
            'sounds-cursor-click': GObject.ParamSpec.string('sounds-cursor-click',
                'Sounds on Cursor Click', '',
                _propFlags, defaults.value('sounds-cursor-click')),
            'text-cipher': GObject.ParamSpec.uint('text-cipher', 'Text Cipher', '',
                _propFlags, 0, 25, defaults.value('text-cipher')),
            hyperlinks: GObject.ParamSpec.boolean('hyperlinks', 'Hyperlinks', '',
                _propFlags, defaults.value('hyperlinks')),
        },
    }, RaModelBase);

    ModelClass._defaults = defaults;
    ModelClass.busName = busName;
    _createdClasses.set(busName, ModelClass);
    return ModelClass;
}
