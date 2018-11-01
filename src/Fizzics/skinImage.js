/* exported FizzicsSkinImage, FizzicsSkinMaxIndex */

const {GdkPixbuf, GObject, Gtk} = imports.gi;

var FizzicsSkinMaxIndex = 8;

var FizzicsSkinImage = GObject.registerClass({
    Properties: {
        index: GObject.ParamSpec.uint(
            'index', 'index', 'index',
            GObject.ParamFlags.READWRITE,
            0, FizzicsSkinMaxIndex, 0),
        pixels: GObject.ParamSpec.uint(
            'pixels', 'pixels', 'pixels',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0, 64, 64),
        'resource-path': GObject.ParamSpec.string(
            'resource-path', 'resource-path', 'resource-path',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            '/com/endlessm/HackToolbox/Fizzics/skins'),
    },
}, class FizzicsSkinImage extends Gtk.Image {
    get index() {
        return this._index;
    }

    set index(value) {
        if ('_index' in this && this._index === value)
            return;
        this._index = value;
        const resource = `${this.resource_path}/${value}.png`;
        this.pixbuf = GdkPixbuf.Pixbuf.new_from_resource_at_scale(
            resource, this.pixels, this.pixels, true);
        this.notify('index');
    }
});
