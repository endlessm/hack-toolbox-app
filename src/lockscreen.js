/* exported Lockscreen */

const {Gdk, Gio, GLib, GObject, Gtk} = imports.gi;

const FADE_OUT_TIME_MS = 750;

var Lockscreen = GObject.registerClass({
    GTypeName: 'Lockscreen',
    Properties: {
        locked: GObject.ParamSpec.boolean('locked', 'Locked', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            true),
        key: GObject.ParamSpec.string('key', 'Key', '',
            GObject.ParamFlags.READWRITE, ''),
    },
    Signals: {
        'overlay-clicked': {},
    },
}, class Lockscreen extends Gtk.Overlay {
    _init(props = {}) {
        super._init(props);

        this._overlay = new Gtk.EventBox({
            expand: true,
            visible: true,
        });
        this._overlay.get_style_context().add_class('lockscreen');
        this._updateUI();

        this._overlay.connect('button-release-event', () => {
            this.emit('overlay-clicked');
            return Gdk.EVENT_PROPAGATE;
        });

        this._manager = Gio.Application.get_default().locksManager;
        this._managerChangedId = 0;
        this.connect('overlay-clicked', this._onClicked.bind(this));
    }

    get locked() {
        return this._locked;
    }

    set locked(value) {
        if ('_locked' in this && this._locked === value)
            return;
        this._locked = value;
        this._updateUI();
        this.notify('locked');
    }

    get key() {
        return this._key;
    }

    set key(key) {
        if ('_key' in this && this._key === key)
            return;
        if (this._managerChangedId !== 0)
            this._manager.disconnect(this._managerChangedId);
        this._managerChangedId = this._manager.connect(
            `changed::${key}`, this._onChanged.bind(this));
        this._key = key;
        this._updateLockState();
    }

    _onChanged() {
        this._updateLockState();

        /* TODO check for key and display can-be-opened graphics */
    }

    _updateLockState() {
        if (!this._key)
            return;
        if (!this._manager.isUnlocked(this._key))
            return;
        this.locked = false;
    }

    _onClicked() {
        if (!this._key)
            return;
        if (!this._manager.hasKey(this._key))
            return;
        this._manager.setUnlocked(this._key);
    }

    _updateUI() {
        if (!this._overlay)
            return;

        const style = this._overlay.get_style_context();
        if (this._locked) {
            style.add_class('locked');
            this.add_overlay(this._overlay);
        } else {
            style.remove_class('locked');

            // hide widget after transition completes, so that it doesn't
            // continue to intercept clicks
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, FADE_OUT_TIME_MS, () => {
                this.remove(this._overlay);
                return GLib.SOURCE_REMOVE;
            });
        }

        this.set_overlay_pass_through(this._overlay, !this._locked);
    }
});
