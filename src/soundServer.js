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
    constructor() {
        const SoundServerProxy = Gio.DBusProxy.makeProxyWrapper(SoundServerIface);
        this._proxy = new SoundServerProxy(Gio.DBus.session,
            'com.endlessm.HackSoundServer', '/com/endlessm/HackSoundServer');
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

    // Most common use case, fire and forget, no return value
    playFull(id, options) {
        const variants = {};

        for (const key in options) {
            if (typeof options[key] === 'number') {
                variants[key] = new GLib.Variant('d', options[key]);
            } else if (key === 'recalculate') {
                this.constructor._recalculateToVariant(options[key], variants);
            } else {
                log(`'${key}' ignored because not a number or invalid ` +
                    '\'recalculate\' structure');
            }
        }

        this._proxy.PlayFullRemote(id, variants, (out, err) => {
            if (err)
                logError(err, `Error playing sound ${id}`);
        });
    }

    static _recalculateToVariant(data, variants) {
        const props = {};
        for (const prop_name in data) {
            if (!data.hasOwnProperty(prop_name))
                continue;

            const prop = {};
            for (const recalculate_param in data[prop_name]) {
                if (!data[prop_name].hasOwnProperty(recalculate_param))
                    continue;

                switch (recalculate_param) {
                case 'x':
                    prop[recalculate_param] = new GLib.Variant('d',
                        data[prop_name][recalculate_param]);
                    break;
                default:
                    log(`'recalculate.${prop_name}.${recalculate_param}' ` +
                        'will be ignored');
                }
            }
            props[prop_name] = new GLib.Variant('a{sv}', prop);
        }
        variants['recalculate'] = new GLib.Variant('a{sv}', props);
    }

    stop(uuid) {
        this._proxy.StopSoundRemote(uuid, (out, err) => {
            if (err)
                logError(err, `Error stopping sound ${uuid}`);
        });
    }
}

var getDefault = (function () {
    let defaultSoundServer;
    return function () {
        if (!defaultSoundServer)
            defaultSoundServer = new SoundServer();
        return defaultSoundServer;
    };
}());
