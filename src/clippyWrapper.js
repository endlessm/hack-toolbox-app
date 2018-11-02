/* exported ClippyWrapper */

const {Gio, GObject} = imports.gi;

const ClippyViewName = 'view.JSContext.globalParameters';
const ClippyObjectPath = '/com/endlessm/Clippy';
const ClippyIface = `
<node xmlns:doc="http://www.freedesktop.org/dbus/1.0/doc.dtd">
  <interface name='com.endlessm.Clippy'>
    <method name='Export'>
      <arg type='s' name='object' />
      <arg type='s' name='path' direction='out'/>
      <arg type='s' name='iface' direction='out'/>
    </method>
  </interface>
</node>
`;

var ClippyWrapper = GObject.registerClass({
}, class ClippyWrapper extends GObject.Object {
    _init(props = {}) {
        this._appId = props.appId;
        delete props['appId'];
        super._init(props);
        this._setupRemote();
        this._setupLocal();
    }

    _setupRemote() {
        const Proxy = Gio.DBusProxy.makeProxyWrapper(ClippyIface);
        const proxy = new Proxy(Gio.DBus.session, this._appId, ClippyObjectPath);
        const [path, iface] = proxy.ExportSync(ClippyViewName);

        const ProxyObj = Gio.DBusProxy.makeProxyWrapper(iface);
        this._proxyObj = new ProxyObj(Gio.DBus.session, this._appId, path);
        this._proxyObj.connect('g-properties-changed', this._onRemoteChanged.bind(this));
    }

    _onRemoteChanged(obj, props) {
        const changes = props.deep_unpack();
        Object.keys(changes).forEach(property => {
            if (!(property in this))
                return;
            const value = changes[property].deep_unpack();
            if (value === this[property])
                return;
            this[property] = value;
        });
    }

    _setupLocal() {
        const props = GObject.Object.list_properties.call(this.constructor.$gtype);
        props.forEach(pspec => {
            const property = pspec.get_name();
            this[`_${property}`] = this._proxyObj[property];
            Object.defineProperty(this, property, {
                set(value) {
                    this._proxyObj[property] = value;
                    this[`_${property}`] = value;
                    this.notify(property);
                },
                get() {
                    return this[`_${property}`];
                },
            });
            // FIXME: bind_property bindings behaves differently when the
            // property has '-', so we need we define a '_' alias as well.
            if (!property.includes('-'))
                return;
            Object.defineProperty(this, property.replace(/-/g, '_'), {
                set(value) {
                    this[property] = value;
                },
                get() {
                    return this[property];
                },
            });
        });
    }

    reset() {
        const props = GObject.Object.list_properties.call(this.constructor.$gtype);
        props.forEach(pspec => {
            this[pspec.get_name()] = pspec.default_value;
        });
    }
});
