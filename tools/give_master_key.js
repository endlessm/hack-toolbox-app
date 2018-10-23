const {Gio, GLib} = imports.gi;

const BusName = 'com.endlessm.GameStateService';
const BusPath = '/com/endlessm/GameStateService';
const BusIface = `
    <node>
      <interface name='com.endlessm.GameStateService'>
        <method name='Set'>
          <arg type='s' name='key' direction='in'/>
          <arg type='v' name='value' direction='in'/>
        </method>
      </interface>
    </node>
`;

const Proxy = Gio.DBusProxy.makeProxyWrapper(BusIface);
const proxy = new Proxy(Gio.DBus.session, BusName, BusPath);

const key = 'item.key.master';
const variant = new GLib.Variant('a{sb}', {used: false});
proxy.SetSync(key, variant);
