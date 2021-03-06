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
/* exported generateProto */

const {Gdk, Gio, GLib, GObject, Gtk} = imports.gi;

const Dispatcher = imports.framework.dispatcher;

const SoundServerIface = `
<node>
  <interface name='com.hack_computer.HackSoundServer'>
    <method name='PlaySound'>
      <arg type='s' name='sound_event' direction='in'/>
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

function _logResponse(out, err) {
    if (err)
        logError(err, 'DBus method returned an error');
}

function generateProto(Name, Extends) {
    return {
        Name,
        Extends,

        Properties: {
            // sound on click if true, on hover if false
            click: GObject.ParamSpec.boolean('click', 'Click', '',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
                false),
            soundpack: GObject.ParamSpec.string('soundpack', 'Sound pack', '',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
                ''),
            'allow-navigation': GObject.ParamSpec.boolean('allow-navigation',
                'Allow navigation', '',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
                true),
        },

        _init(props = {}) {
            this._ncards = 0;
            // eslint-disable-next-line no-restricted-syntax
            this.parent(props);
            const SoundServerProxy = Gio.DBusProxy.makeProxyWrapper(SoundServerIface);

            this._audioPlayer = new SoundServerProxy(Gio.DBus.session,
                'com.hack_computer.HackSoundServer', '/com/hack_computer/HackSoundServer');

            if (!this._allowNavigation) {
                // Prevent clicks on cards from actually going anywhere
                // Priority slightly lower than the dispatcher priority
                GLib.idle_add(Gtk.PRIORITY_RESIZE - 9, () => {
                    Dispatcher.get_default().pause();
                    return GLib.SOURCE_REMOVE;
                });
            }
        },

        get click() {
            return this._click;
        },

        set click(value) {
            this._click = value;
        },

        get soundpack() {
            return this._soundpack;
        },

        set soundpack(value) {
            this._soundpack = value;
        },

        get allow_navigation() {
            return this._allowNavigation;
        },

        set allow_navigation(value) {
            this._allowNavigation = value;
        },

        // Module override
        drop_submodule() {
            this._audioPlayer.cleanup();
        },

        // Override of the original Arrangement class
        unpack_card(card) {
            this._ncards--;
            // eslint-disable-next-line no-restricted-syntax
            this.parent(card);
        },

        // Override of the original Arrangement class
        pack_card(card) {
            const id = this._ncards++;
            const key = `framework/${this._soundpack}/${id}`;
            if (this._soundpack) {
                if (this._click) {
                    card.connect('clicked', () => {
                        this._audioPlayer.PlaySoundRemote(key, _logResponse);
                    });
                } else {
                    card.connect('enter-notify-event', () => {
                        // Call method sync, to avoid starting more than one
                        // copy of the sound
                        if (!this._currentSound)
                            [this._currentSound] = this._audioPlayer.PlaySoundSync(key);
                        return Gdk.EVENT_PROPAGATE;
                    });
                    card.connect('leave-notify-event', () => {
                        if (this._currentSound) {
                            this._audioPlayer.StopSoundRemote(this._currentSound,
                                _logResponse);
                            this._currentSound = null;
                        }
                        return Gdk.EVENT_PROPAGATE;
                    });
                }
            }
            // eslint-disable-next-line no-restricted-syntax
            this.parent(card);
        },
    };
}
