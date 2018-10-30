/* exported getDefault */

const {Gio} = imports.gi;

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

const GameStateProxy = Gio.DBusProxy.makeProxyWrapper(BusIface);

var getDefault = (function () {
    let defaultGameStateProxy;
    return function () {
        if (!defaultGameStateProxy) {
            defaultGameStateProxy = new GameStateProxy(Gio.DBus.session,
                BusName, BusPath);
        }
        return defaultGameStateProxy;
    };
}());
