/* exported Lockscreen */

const {GObject, Gtk} = imports.gi;

const _css = `
frame {
    background: -gtk-icontheme('dialog-password'),
                linear-gradient(to right, rgba(61, 70, 81, 1) 0%,
                                          rgba(61, 70, 81, 1) 50%,
                                          rgba(61, 70, 81, 0) 51%,
                                          rgba(61, 70, 81, 0) 100%),
                linear-gradient(to right, rgba(61, 70, 81, 0) 0%,
                                          rgba(61, 70, 81, 0) 50%,
                                          rgba(61, 70, 81, 1) 51%,
                                          rgba(61, 70, 81, 1) 100%);
    background-repeat: no-repeat;
    background-position: center, -600px, 600px;
    opacity: 0;
    transition-property: background-position, opacity;
    transition-duration: 0.5s, 0.75s;
    transition-timing-function: cubic-bezier(.5, 0, 1, .5), linear;
}

frame.locked {
    background-position: center, 0px, 0px;
    opacity: 1;
}
`;

var Lockscreen = GObject.registerClass({
    Properties: {
        locked: GObject.ParamSpec.boolean('locked', 'Locked', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            true),
    },
}, class Lockscreen extends Gtk.Overlay {
    _init(props = {}) {
        super._init(props);

        this._overlay = new Gtk.Frame({
            expand: true,
            visible: true,
        });
        this.add_overlay(this._overlay);

        const provider = new Gtk.CssProvider();
        provider.load_from_data(_css);
        const style = this._overlay.get_style_context();
        style.add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

        this._updateUI();
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

    _updateUI() {
        if (!this._overlay)
            return;

        const style = this._overlay.get_style_context();
        if (this._locked)
            style.add_class('locked');
        else
            style.remove_class('locked');

        this.set_overlay_pass_through(this._overlay, !this._locked);
    }
});