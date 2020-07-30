/*
 * Copyright © 2020 Endless OS Foundation LLC.
 *
 * This file is part of hack-toolbox-app
 * (see https://github.com/endlessm/hack-toolbox-app).
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
/* exported getDefault */

const {Gio, GLib} = imports.gi;

const SoundServerIface = `
<node>
  <interface name='com.hack_computer.HackSoundServer'>
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
            'com.hack_computer.HackSoundServer', '/com/hack_computer/HackSoundServer');
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
