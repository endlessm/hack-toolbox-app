/* exported LogoImage */

const {GdkPixbuf, GObject, Gtk} = imports.gi;

var LogoImage = GObject.registerClass({
    Properties: {
        resource: GObject.ParamSpec.override('resource', Gtk.Image.$gtype),
    },
}, class LogoImage extends Gtk.Image {
    get resource() {
        return this._resource;
    }

    set resource(value) {
        if ('_resource' in this && this._resource === value)
            return;
        this._resource = value;
        this.pixbuf = GdkPixbuf.Pixbuf.new_from_resource_at_scale(value,
            50, -1, true);
        this.notify('resource');
    }
});
