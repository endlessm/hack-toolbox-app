/* exported HBSkinImage, HBSkinMaxIndex */

const {GdkPixbuf, GObject, Gtk} = imports.gi;

var HBSkinMaxIndex = 8;

var HBSkinImage = GObject.registerClass({
    Properties: {
        index: GObject.ParamSpec.uint(
            'index', 'index', 'index',
            GObject.ParamFlags.READWRITE,
            0, HBSkinMaxIndex, 0),
        pixels: GObject.ParamSpec.uint(
            'pixels', 'pixels', 'pixels',
            GObject.ParamFlags.READWRITE,
            0, 64, 64),
    },
}, class HBSkinImage extends Gtk.Image {
    get index() {
        return this._index;
    }

    set index(value) {
        if ('_index' in this && this._index === value)
            return;
        this._index = value;
        const resource = `/com/endlessm/HackToolbox/hackyballs/skins/${value}.png`;
        this.pixbuf = GdkPixbuf.Pixbuf.new_from_resource_at_scale(
            resource, this.pixels, this.pixels, true);
        this.notify('index');
    }
});
