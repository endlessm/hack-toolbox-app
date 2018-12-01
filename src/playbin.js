/* exported Playbin */

const {Gdk, GLib, GObject, Gtk, Gst} = imports.gi;

var Playbin = GObject.registerClass({
    CssName: 'playbin',
    Properties: {
        uri: GObject.ParamSpec.string('uri', 'URI', '',
            GObject.ParamFlags.READWRITE,
            ''
        ),
    },
    Signals: {
        clicked: {},
        start: {},
        done: {},
    },
}, class Playbin extends Gtk.EventBox {
    _init(props) {
        super._init(props);

        this._css_provider = new Gtk.CssProvider();
        this.get_style_context().add_provider(
            this._css_provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );

        this.connect('button-release-event', () => {
            this.emit('clicked');
            return Gdk.EVENT_PROPAGATE;
        });
    }

    _ensurePlaybin () {
        if (this._playbin)
            return;

        Gst.init_check(null);

        this._playbin = Gst.parse_launch('playbin3 name=playbin video-sink=gtksink');
        this._playbin.videoFilter = Gst.parse_bin_from_description(
            'videocrop name=videocrop ! alpha method=green',
            true
        );
        this._videocrop = this._playbin.videoFilter.get_by_name('videocrop');

        this._playbin.videoSink.showPrerollFrame = false;
        this._video_widget = this._playbin.videoSink.widget;
        this._video_widget.expand = true;
        this._video_widget.noShowAll = true;
        this._video_widget.ignoreAlpha = false;
        this._video_widget.hide();
        this.add(this._video_widget);

        this._video_widget.connect('size-allocate', this._updateCropArea.bind(this));

        this._playbin.get_bus().add_watch(0, this._bus_watch.bind(this));
    }

    _updateCropArea () {
        const width = this._video_widget.get_allocated_width();
        const height = this._video_widget.get_allocated_height();

        if (width < 2 || height < 2 || !this._video_width || !this._video_height)
            return;

        const crop_x = (this._video_width - width) / 2;
        const crop_y = (this._video_height - height) / 2;

        this._videocrop.left = crop_x;
        this._videocrop.right = crop_x;
        this._videocrop.top = crop_y;
        this._videocrop.bottom = crop_y;

        if (!this._started && this._state === Gst.State.PLAYING) {
            this._started = true;
            this.emit('start');
        }
    }

    _updateSizeFromStreamCollection (collection) {
        const n = collection.get_size();
        let stream = null;

        /* Find video stream */
        for (let i = 0; i < n; i++) {
            stream = collection.get_stream(i);

            if (stream.get_stream_type() === Gst.StreamType.VIDEO)
                break;
        }

        if (!stream)
            return;

        /* Get video size */
        const caps = stream.get_caps();
        const caps_struct = caps.get_structure(0);
        const [width_ok, width] = caps_struct.get_int('width');
        const [height_ok, height] = caps_struct.get_int('height');

        if (width_ok && height_ok) {
            this._video_width = width;
            this._video_height = height;
            this._video_widget.show_now();
        }
    }

    _playbackDone () {
        this.emit('done');
        this._playbin.set_state(Gst.State.NULL);
        this.remove(this._video_widget);
        this._playbin = null;
        this._videocrop = null;
        this._video_widget = null;
    }

    _bus_watch (bus, msg) {
        if (msg.type === Gst.MessageType.EOS) {
            this._playbackDone();
            return GLib.SOURCE_REMOVE;
        } else if (msg.type === Gst.MessageType.STREAMS_SELECTED) {
            this._updateSizeFromStreamCollection(msg.parse_streams_selected());
        } else if (msg.type === Gst.MessageType.STATE_CHANGED) {
            const [, newstate] = msg.parse_state_changed();
            this._state = newstate;
        }

        return GLib.SOURCE_CONTINUE;
    }

    setBackground (url) {
        try {
            this._css_provider.load_from_data(`
playbin.locked {
    background: url('${url}') no-repeat center;
}`
            );
        } catch (e) {
            logError(e, 'Failed to load css');
        }
    }

    play () {
        if (!this.uri)
            return;

        this._ensurePlaybin();

        this._started = false;
        this._playbin.uri = this.uri;
        this._playbin.set_state(Gst.State.PLAYING);
    }

    set locked(value) {
        const style = this.get_style_context();
        if (value)
            style.add_class('locked');
        else
            style.remove_class('locked');
    }
});
