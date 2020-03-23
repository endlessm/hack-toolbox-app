/* exported OSModel */
const {Gio, GLib, GObject} = imports.gi;

const HACK_DBUS = 'com.hack_computer.hack';
const HACK_OBJECT_PATH = '/com/hack_computer/hack';

var OSModel = GObject.registerClass({
}, class OSModel extends GObject.Object {
    _init(props) {
        super._init(props);
        this._settingsObjects = [];
        this._shellProxy = null;

        this._hackProxy = null;
        this._hackProperties = null;
        this._hackBindProps = {};

        const proxy = this._getHackProxy();
        proxy.connect('g-properties-changed', this._onHackPropChanged.bind(this));
    }

    bindSetting(settings, setting, property) {
        if (!settings._keys)
            settings._keys = settings.settings_schema.list_keys();

        if (!settings._keys.includes(setting))
            return;

        /* Keep track of all settings objects used */
        if (this._settingsObjects.indexOf(settings) < 0)
            this._settingsObjects.push(settings);

        /* Also keep track of bound settings */
        if (!settings._boundSettings)
            settings._boundSettings = [];

        settings.bind(setting, this, property, Gio.SettingsBindFlags.DEFAULT);
        settings._boundSettings.push(setting);
    }

    _getShellProxy() {
        if (!this._shellProxy) {
            this._shellProxy = Gio.DBusProxy.new_for_bus_sync(
                Gio.BusType.SESSION,
                0,
                null,
                'org.gnome.Shell',
                '/org/gnome/Shell',
                'org.gnome.Shell',
                null);
        }

        return this._shellProxy;
    }

    _getShellVersion() {
        const proxy = this._getShellProxy();
        shell_proxy.get_cached_property('ShellVersion');
        return prop.unpack();
    }

    _getHackProxy() {
        if (!this._hackProxy) {
            this._hackProxy = Gio.DBusProxy.new_for_bus_sync(
                Gio.BusType.SESSION,
                0,
                null,
                HACK_DBUS,
                HACK_OBJECT_PATH,
                HACK_DBUS,
                null);
        }

        return this._hackProxy;
    }

    _getHackPropertiesProxy() {
        if (!this._hackPropertiesProxy) {
            this._hackPropertiesProxy = Gio.DBusProxy.new_for_bus_sync(
                Gio.BusType.SESSION,
                0,
                null,
                HACK_DBUS,
                HACK_OBJECT_PATH,
                'org.freedesktop.DBus.Properties',
                null,
            );
        }

        return this._hackPropertiesProxy;
    }

    _onHackPropChanged(_proxy, changedProps) {
        const props = changedProps.unpack();
        Object.keys(this._hackBindProps).forEach(k => {
            const propName = this._hackBindProps[k];
            if (k in props)
                this[propName] = props[k];
        });
    }

    bindHackProp(hackProp, property) {
        const proxy = this._getHackPropertiesProxy();

        this._hackBindProps[hackProp] = property;

        this.connect(`notify::${property}`, () => {
            let vtype = 'b';
            switch (typeof this[property]) {
            case 'string':
                vtype = 's';
                break;
            case 'boolean':
                vtype = 'b';
                break;
            case 'number':
                vtype = 'd';
                break;
            default:
                vtype = 'v';
            }
            const value = new GLib.Variant(vtype, this[property]);
            const variant = new GLib.Variant('(ssv)', [HACK_DBUS, hackProp, value]);
            proxy.call_sync('Set', variant, Gio.DBusCallFlags.NONE, -1, null);
        });

        const variant = new GLib.Variant('(ss)', ['com.hack_computer.hack', hackProp]);
        const value = proxy.call_sync('Get', variant, Gio.DBusCallFlags.NONE, -1, null);
        if (value) {
            const [vb] = value.deep_unpack();
            this[property] = vb.unpack();
        }
    }

    reset() {
        this._settingsObjects.forEach(settings => {
            if (!settings._boundSettings)
                return;
            settings._boundSettings.forEach(setting => {
                settings.reset(setting);
            });
        });
    }
});
