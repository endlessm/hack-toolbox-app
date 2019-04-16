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

var getDefault = (function() {
    let defaultGameStateProxy;
    return function() {
        if (!defaultGameStateProxy) {
            defaultGameStateProxy = new GameStateProxy(Gio.DBus.session,
                BusName, BusPath);
            // Promisify methods
            defaultGameStateProxy.Get = function(key) {
                return new Promise((resolve, reject) => {
                    this.GetRemote(key, ([value], err) => {
                        if (err)
                            reject(err);
                        else
                            resolve(value);
                    });
                });
            };
            defaultGameStateProxy.Set = function(key, value) {
                return new Promise((resolve, reject) => {
                    this.SetRemote(key, value, (ret, err) => {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                });
            };
            // Helpers
            defaultGameStateProxy.getDictValue = async function(key, property, defaultValue) {
                try {
                    const variant = await this.Get(key);
                    const dict = variant.deep_unpack();
                    return dict[property].deep_unpack();
                } catch (e) {
                    return defaultValue;
                }
            };
            defaultGameStateProxy.getDictValueSync = function(key, property, defaultValue) {
                try {
                    const [variant] = this.GetSync(key);
                    const dict = variant.deep_unpack();
                    return dict[property].deep_unpack();
                } catch (e) {
                    if (e.matches(Gio.DBusError, Gio.DBusError.SERVICE_UNKNOWN))
                        throw e;

                    return defaultValue;
                }
            };
        }
        return defaultGameStateProxy;
    };
}());
