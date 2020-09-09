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
