const {Gio, GLib} = imports.gi;

const BusName = 'com.hack_computer.GameStateService';
const BusPath = '/com/hack_computer/GameStateService';
const BusIface = `
    <node>
      <interface name='com.hack_computer.GameStateService'>
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
const variant = new GLib.Variant('a{sb}', {
    consume_after_use: false,
    used: false,
});
proxy.SetSync(key, variant);
