/* exported LocksManager */

const {Gio, GLib, GObject} = imports.gi;

const BusName = 'com.endlessm.GameStateService';
const BusPath = '/com/endlessm/GameStateService';
const BusIface = `
    <node>
      <interface name='com.endlessm.GameStateService'>
        <method name='Get'>
          <arg type='s' name='key' direction='in'/>
          <arg type='v' name='value' direction='out'/>
        </method>
        <method name='Set'>
          <arg type='s' name='key' direction='in'/>
          <arg type='v' name='value' direction='in'/>
        </method>
        <signal name='changed'>
          <arg type='s' name='key'/>
          <arg type='v' name='value'/>
        </signal>
      </interface>
    </node>
`;

var LocksManager = GObject.registerClass({
    Signals: {
        changed: {
            flags: GObject.SignalFlags.RUN_FIRST | GObject.SignalFlags.DETAILED,
        },
    },
}, class LocksManager extends GObject.Object {
    _init(props = {}) {
        super._init(props);
        const Proxy = Gio.DBusProxy.makeProxyWrapper(BusIface);
        this._proxy = new Proxy(Gio.DBus.session, BusName, BusPath);
        this._proxy.connect('g-signal', this._onChanged.bind(this));
    }

    _onChanged(proxy, sender, signal, params) {
        if (signal !== 'changed')
            return;
        const key = params.get_child_value(0).deep_unpack();
        if (!key.startsWith('item.key'))
            return;
        this.emit(`changed::${key}`);
    }

    hasKey(key) {
        try {
            this._proxy.GetSync(key);
            return true;
        } catch (error) {
            return false;
        }
    }

    isUnlocked(key) {
        try {
            const [variant] = this._proxy.GetSync(key);
            return variant.deep_unpack()
                          .used
                          .deep_unpack();
        } catch (error) {
            return false;
        }
    }

    setUnlocked(key) {
        const variant = new GLib.Variant('a{sb}', {used: true});
        this._proxy.SetSync(key, variant);
    }
});
