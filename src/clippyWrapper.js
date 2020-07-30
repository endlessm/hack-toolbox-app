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
/* exported ClippyWrapper */

const {Gio, GObject} = imports.gi;

const ClippyObjectPath = '/com/hack_computer/Clippy';
const ClippyIface = `
<node xmlns:doc="http://www.freedesktop.org/dbus/1.0/doc.dtd">
  <interface name='com.hack_computer.Clippy'>
    <method name='Export'>
      <arg type='s' name='object' />
      <arg type='s' name='path' direction='out'/>
      <arg type='s' name='iface' direction='out'/>
    </method>
  </interface>
</node>
`;

var ClippyWrapper = GObject.registerClass({
}, class ClippyWrapper extends GObject.Object {
    _init(appId, props = {}, variableName = 'globalParameters') {
        this._appId = appId;
        super._init(props);
        this._setupRemote(`view.JSContext.${variableName}`);
        this._setupLocal();
    }

    // Note: not a GObject property, notify not needed
    get inReset() {
        return !!this._inReset;
    }

    _setupRemote(viewName) {
        const Proxy = Gio.DBusProxy.makeProxyWrapper(ClippyIface);
        const proxy = new Proxy(Gio.DBus.session, this._appId, ClippyObjectPath);
        const [path, iface] = proxy.ExportSync(viewName);

        const ProxyObj = Gio.DBusProxy.makeProxyWrapper(iface);
        this._proxyObj = new ProxyObj(Gio.DBus.session, this._appId, path);
        this._proxyObj.connect('g-properties-changed', this._onRemoteChanged.bind(this));
    }

    _onRemoteChanged(obj, props) {
        const changes = props.deep_unpack();
        Object.keys(changes).forEach(property => {
            if (!(property in this))
                return;
            const value = changes[property].deep_unpack();
            if (value === this[property])
                return;
            this[property] = value;
        });
    }

    _setupLocal() {
        const props = GObject.Object.list_properties.call(this.constructor.$gtype);
        props.forEach(pspec => {
            const property = pspec.get_name();
            this[`_${property}`] = this._proxyObj[property];
            Object.defineProperty(this, property, {
                set(value) {
                    this._proxyObj[property] = value;
                    this[`_${property}`] = value;
                    this.notify(property);
                },
                get() {
                    return this[`_${property}`];
                },
            });
            // FIXME: bind_property bindings behaves differently when the
            // property has '-', so we need we define a '_' alias as well.
            if (!property.includes('-'))
                return;
            Object.defineProperty(this, property.replace(/-/g, '_'), {
                set(value) {
                    this[property] = value;
                },
                get() {
                    return this[property];
                },
            });
        });
    }

    reset() {
        const props = GObject.Object.list_properties.call(this.constructor.$gtype);
        this._inReset = true;
        try {
            props.forEach(pspec => {
                this[pspec.get_name()] = pspec.default_value;
            });
        } finally {
            this._inReset = false;
        }
    }
});
