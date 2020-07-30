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

const {Gio} = imports.gi;

const BusName = 'com.hack_computer.GameStateService';
const BusPath = '/com/hack_computer/GameStateService';
const BusIface = `
<node>
  <interface name='com.hack_computer.GameStateService'>
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
                    if (e.matches(Gio.DBusError, Gio.DBusError.SERVICE_UNKNOWN))
                        throw e;

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
