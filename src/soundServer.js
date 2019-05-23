/* exported getDefault */

const {Gio, GLib} = imports.gi;

const SoundServerIface = `
<node>
  <interface name='com.endlessm.HackSoundServer'>
    <method name='PlaySound'>
      <arg type='s' name='sound_event' direction='in'/>
      <arg type='s' name='uuid' direction='out'/>
    </method>
    <method name='PlayFull'>
      <arg type='s' name='sound_event' direction='in'/>
      <arg type='a{sv}' name='options' direction='in'/>
      <arg type='s' name='uuid' direction='out'/>
    </method>
    <method name='StopSound'>
      <arg type='s' name='uuid' direction='in'/>
    </method>
    <signal name='Error'>
      <arg type='s' name='uuid'/>
      <arg type='s' name='error_message'/>
      <arg type='s' name='error_domain'/>
      <arg type='i' name='error_code'/>
      <arg type='s' name='debug'/>
    </signal>
  </interface>
</node>
`;

class SoundServer {
    constructor(bus_name=null) {
        try {
            this.connection = this._getConnection(bus_name);
        } catch (e) {
            logError(e, `Cannot create a connection for '${bus_name}'. ` +
                'Using default connection');
            this.connection = this._getConnection();
        }
        const SoundServerProxy = Gio.DBusProxy.makeProxyWrapper(SoundServerIface);
        this._proxy = new SoundServerProxy(connection,
            'com.endlessm.HackSoundServer', '/com/endlessm/HackSoundServer');
    }

    _getConnection(bus_name=null) {
        if (!bus_name)
            return Gio.DBus.session;
        const address = Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION,
                                                          null);
        const connectionFlags =
            Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT |
            Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION;
        const connection =
            Gio.DBusConnection.new_for_address_sync(address, connectionFlags,
                                                    null, null);
        connection.exit_on_close = true;
        Gio.bus_own_name_on_connection(connection, bus_name,
                                       Gio.BusNameOwnerFlags.NONE,
                                       null, null);
    }

    // Most common use case, fire and forget, no return value
    play(id) {
        this._proxy.PlaySoundRemote(id, (out, err) => {
            if (err)
                logError(err, `Error playing sound ${id}`);
        });
    }

    // Use if you need the return value to stop the sound
    playAsync(id) {
        return new Promise((resolve, reject) => {
            this._proxy.PlaySoundRemote(id, (out, err) => {
                if (err) {
                    reject(err);
                    return;
                }
                const [uuid] = out;
                resolve(uuid);
            });
        });
    }

    // Use sparingly, only if you need the return value, but also can't use an
    // async function
    playSync(id) {
        return this._proxy.PlaySoundSync(id);
    }

    playFull(id, options) {
        const variants = {};

        for (const key in options) {
            if (typeof options[key] === 'number')
                variants[key] = new GLib.Variant('d', options[key]);
            else
                log(`'${key}' ignored because not a number`);
        }

        this._proxy.PlayFullRemote(id, variants, (out, err) => {
            if (err)
                logError(err, `Error playing sound ${id}`);
        });
    }

    stop(uuid) {
        this._proxy.StopSoundRemote(uuid, (out, err) => {
            if (err)
                logError(err, `Error stopping sound ${uuid}`);
        });
    }
}

var getDefault = (function() {
    let defaultSoundServer;
    return function() {
        if (!defaultSoundServer)
            defaultSoundServer = new SoundServer();
        return defaultSoundServer;
    };
}());
