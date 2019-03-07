/* exported TopicButton */

const {GObject, Gtk} = imports.gi;

var TopicButton = GObject.registerClass({
    Properties: {
        id: GObject.ParamSpec.string('id', 'ID', 'Machine-facing topic ID',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
        title: GObject.ParamSpec.string('title', 'Title', 'Topic title',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
        'icon-name': GObject.ParamSpec.string('icon-name', 'Icon name',
            'Named icon for topic illustration',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
    },
}, class TopicButton extends Gtk.Frame {
    _init(props = {}) {
        super._init(props);

        const overlay = new Gtk.Overlay();
        const box = new Gtk.Box({
            halign: Gtk.Align.FILL,
            orientation: Gtk.Orientation.VERTICAL,
        });
        const icon = new Gtk.Image({
            iconName: this._iconName,
            pixelSize: 80,
        });
        const label = new Gtk.Label({
            hexpand: true,
            label: this._title,
        });

        box.set_center_widget(icon);
        box.pack_end(label, false, false, 0);
        overlay.add(box);
        this.add(overlay);

        this.get_style_context().add_class('topic');
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get icon_name() {
        return this._iconName;
    }

    set icon_name(value) {
        this._iconName = value;
    }

    get needs_attention() {
        return this._needsAttention;
    }

    set needs_attention(value) {
        if ('_needsAttention' in this && this._needsAttention === value)
            return;
        this._needsAttention = value;
        this.notify('needs-attention');
    }
});
