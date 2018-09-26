/* exported generateProto */
/* global custom_modules */

const {Gdk, GLib, GObject, Gtk} = imports.gi;

const {AudioPlayer} = custom_modules.audioPlayer;
const Dispatcher = imports.framework.dispatcher;

function generateProto(Name, Extends, nchannels) {
    var _nchannels = nchannels;  // capture in closure
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
        },

        _init(props = {}) {
            this._ncards = 0;
            // eslint-disable-next-line no-restricted-syntax
            this.parent(props);
            this._audioPlayer = new AudioPlayer({
                channels: _nchannels,
                soundpack: this._soundpack,
            });

            if (this._click) {
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

        // Module override
        drop_submodule() {
            this._audioPlayer.cleanup();
        },

        // Override of the original Arrangement class
        pack_card(card) {
            const id = this._ncards++;
            if (this._click) {
                card.connect('clicked', () => this._audioPlayer.play(id));
            } else {
                card.connect('enter-notify-event', () => {
                    this._audioPlayer.play(id);
                    return Gdk.EVENT_PROPAGATE;
                });
                card.connect('leave-notify-event', () => {
                    this._audioPlayer.stop(id);
                    return Gdk.EVENT_PROPAGATE;
                });
            }
            // eslint-disable-next-line no-restricted-syntax
            this.parent(card);
        },
    };
}