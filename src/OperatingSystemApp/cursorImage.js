/* exported cursorIDToResource, CursorImage */

const {GdkPixbuf, GObject, Gtk} = imports.gi;

function cursorIDToResource(id) {
    return `/com/hack_computer/HackToolbox/OperatingSystemApp/icons/${id}.png`;
}

var CursorImage = GObject.registerClass({
    Properties: {
        theme: GObject.ParamSpec.override('resource', Gtk.Image.$gtype),
    },
}, class CursorImage extends Gtk.Image {
    get resource() {
        return this._resource;
    }

    set resource(value) {
        if ('_resource' in this && this._resource === value)
            return;
        this._resource = value;
        this.pixbuf = GdkPixbuf.Pixbuf.new_from_resource_at_scale(value,
            96, -1, true);
        this.notify('resource');
    }
});
