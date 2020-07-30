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
/* exported SketchModel */

const {Gio, GObject} = imports.gi;

const INTERFACE = `
<node>
  <interface name="com.hack_computer.Sketchbook.Variables">
    <property name="Title" type="s" access="readwrite"/>
    <property name="Description" type="s" access="readwrite"/>
    <property name="Instructions" type="s" access="readwrite"/>
    <property name="Code" type="s" access="readwrite"/>
    <method name="Reset"/>
    <method name="Refresh"/>
  </interface>
</node>
`;
const VariablesProxy = Gio.DBusProxy.makeProxyWrapper(INTERFACE);

const KEBAB_NAMES = {
    Title: 'title',
    Description: 'description',
    Instructions: 'instructions',
    Code: 'code',
};

// Promisify Gio.DBus.get(), not possible with Gio._promisify()
Gio.DBus._originalGet = Gio.DBus.get;
Gio.DBus.get = function(...args) {
    if (!args.every(arg => typeof arg !== 'function'))
        return this._originalGet(...args);
    return new Promise((resolve, reject) => {
        const callStack = new Error().stack.split('\n').slice(2)
            .join('\n');
        this._originalGet(...args, function(unused, res) {
            try {
                resolve(Gio.DBus.get_finish(res));
            } catch (error) {
                if (error.stack)
                    error.stack += `### Promise created here: ###\n${callStack}`;
                else
                    error.stack = callStack;
                reject(error);
            }
        });
    });
};

var SketchModel = GObject.registerClass({
    Properties: {
        title: GObject.ParamSpec.string('title', 'Title', 'Sketch title',
            GObject.ParamFlags.READWRITE, ''),
        description: GObject.ParamSpec.string('description', 'Description',
            'Detailed description of the sketch',
            GObject.ParamFlags.READWRITE, ''),
        instructions: GObject.ParamSpec.string('instructions', 'Instructions',
            'Instructions for using the sketch',
            GObject.ParamFlags.READWRITE, ''),
        code: GObject.ParamSpec.string('code', 'Code', 'Sketch code',
            GObject.ParamFlags.READWRITE, ''),
    },
}, class SketchModel extends GObject.Object {
    // This ought to be implemented via the Gio.AsyncInitable interface, but
    // that's not currently possible in GJS
    async initAsync(cancellable = null) {
        const sessionBus = await Gio.DBus.get(Gio.BusType.SESSION, cancellable);
        this._proxy = await new Promise((resolve, reject) => {
            void new VariablesProxy(sessionBus, 'com.hack_computer.Sketchbook',
                '/com/hack_computer/Sketchbook',
                (initable, error) => {
                    if (error)
                        reject(error);
                    else
                        resolve(initable);
                }, cancellable);
        });
        this._proxy.connect('g-properties-changed',
            this._onRemotePropertiesChanged.bind(this));
    }

    _onRemotePropertiesChanged(proxy, changedProperties, invalidatedProperties) {
        Object.keys(changedProperties.deep_unpack())
            .concat(invalidatedProperties)
            .forEach(name => this.notify(KEBAB_NAMES[name]));
    }

    reset() {
        this._proxy.ResetRemote();
    }

    refresh() {
        return new Promise((resolve, reject) => {
            this._proxy.RefreshRemote((ret, error) => {
                if (error) {
                    reject(error);
                } else {
                    this._needsRefresh = false;
                    resolve(...ret);
                }
            });
        });
    }

    get title() {
        return this._proxy.Title;
    }

    set title(value) {
        this._proxy.Title = value;
    }

    get description() {
        return this._proxy.Description;
    }

    set description(value) {
        this._proxy.Description = value;
    }

    get instructions() {
        return this._proxy.Instructions;
    }

    set instructions(value) {
        this._proxy.Instructions = value;
    }

    get code() {
        return this._proxy.Code;
    }

    set code(value) {
        this._proxy.Code = value;
    }

    get needsRefresh() {
        return this._needsRefresh;
    }

    set needsRefresh(value) {
        this._needsRefresh = value;
    }
});
