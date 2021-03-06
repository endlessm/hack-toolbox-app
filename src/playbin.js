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
/* exported Playbin */

const {Gdk, GLib, GObject, Gtk, Gst, HackToolbox} = imports.gi;

const Lock = GObject.registerClass({
    CssName: 'lock',
}, class Lock extends Gtk.Button {
    _init(props) {
        props.canDefault = false;
        props.canFocus = false;

        super._init(props);

        this._css_provider = new Gtk.CssProvider();
        this.get_style_context().add_provider(
            this._css_provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );
    }

    set background(url) {
        try {
            this._css_provider.load_from_data(`
lock {
    background: url('${url}') no-repeat center/cover;
    transition: background 1s ease;
}`
            );
        } catch (e) {
            logError(e, 'Failed to load css');
        }
    }
});

var Playbin = GObject.registerClass({
    CssName: 'playbin',
    Signals: {
        clicked: {},
        done: {},
    },
}, class Playbin extends Gtk.Stack {
    _init(props) {
        this._uri = null;
        this._hasKey = false;

        props.transitionType = props.transitionType || Gtk.StackTransitionType.CROSSFADE;
        props.transitionDuration = props.transitionDuration || 100;

        super._init(props);

        /* Use a button to catch the click event */
        this._button = new Lock({visible: true});
        this.add(this._button);

        this._button.connect('clicked', () => {
            this.emit('clicked');
        });

        this.connect('realize', () => {
            this._cursor = Gdk.Cursor.new_from_name(this.get_display(), 'pointer');
            this.window.set_cursor(this._hasKey ? this._cursor : null);
        });

        /* Update crop values on size allocation */
        this.connect('size-allocate', (self, alloc) => {
            this._updateCropArea(alloc);
        });
    }

    _ensurePlaybin() {
        if (this._playbin)
            return;

        Gst.init_check(null);

        this._playbin = Gst.parse_launch('playbin3 name=playbin video-sink=gtksink');
        const videoFilter = Gst.parse_bin_from_description(
            'videocrop name=videocrop ! alpha method=green',
            true
        );
        this._videocrop = videoFilter.get_by_name('videocrop');
        this._playbin.set_property('video-filter', videoFilter);

        var videoSink = HackToolbox.property_get_object(this._playbin, 'video-sink');
        this._video_widget = HackToolbox.property_get_object(videoSink, 'widget');
        this._video_widget.expand = true;
        this._video_widget.noShowAll = true;
        this._video_widget.ignoreAlpha = false;
        this._video_widget.show();
        this.add(this._video_widget);

        this._has_ready_to_show = !!GObject.signal_lookup('ready-to-show',
            this._video_widget.constructor.$gtype);

        if (this._has_ready_to_show) {
            this._video_widget.connect('ready-to-show', () => {
                this.set_visible_child(this._video_widget);
            });
        }

        this._playbin.get_bus().add_watch(0, this._bus_watch.bind(this));
    }

    _updateCropArea(alloc) {
        if (!this._videocrop ||
            !this._video_width || !this._video_height ||
            alloc.width < 2 || alloc.height < 2)
            return;

        const crop_x = (this._video_width - alloc.width) / 2;
        const crop_y = (this._video_height - alloc.height) / 2;

        this._videocrop.set_property('left', crop_x);
        this._videocrop.set_property('right', crop_x);
        this._videocrop.set_property('top', crop_y);
        this._videocrop.set_property('bottom', crop_y);
    }

    _onStreamsSelected(msg) {
        const collection = msg.parse_streams_selected();
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
            this._updateCropArea(this.get_allocation());
        }
    }

    destroy() {
        this.remove(this._video_widget);
        this._uri = null;
        this._playbin = null;
        this._videocrop = null;
        this._video_widget = null;
        this._video_width = 0;
        this._video_height = 0;
    }

    _onEndOfStream() {
        this._playbin.set_state(Gst.State.NULL);
        this.emit('done');
    }

    _onStateChanged(msg) {
        if (this._started)
            return;

        const [, newstate] = msg.parse_state_changed();

        if (newstate === Gst.State.PLAYING) {
            if (!this._has_ready_to_show)
                this.set_visible_child(this._video_widget);

            this._started = true;
            if (this.get_realized())
                this.window.set_cursor(null);
        }
    }

    _bus_watch(bus, msg) {
        if (msg.type === Gst.MessageType.EOS) {
            if (this._playbin)
                this._onEndOfStream(msg);
            else
                return GLib.SOURCE_REMOVE;
        } else if (msg.type === Gst.MessageType.STREAMS_SELECTED) {
            this._onStreamsSelected(msg);
        } else if (msg.type === Gst.MessageType.STATE_CHANGED) {
            this._onStateChanged(msg);
        }

        return GLib.SOURCE_CONTINUE;
    }

    get uri() {
        return this._uri;
    }

    set uri(value) {
        if (this._uri === value)
            return;

        this._uri = value;

        if (this._uri) {
            this._ensurePlaybin();
            this._playbin.set_property('uri', this._uri);
            this._playbin.set_state(Gst.State.PAUSED);
        }
    }

    play() {
        if (!this._uri)
            return;

        this._started = false;
        this._playbin.set_state(Gst.State.PLAYING);
    }

    set background(url) {
        this._button.background = url;
    }

    set hasLock(value) {
        const style = this.get_style_context();
        if (value)
            style.remove_class('no-lock');
        else
            style.add_class('no-lock');
    }

    get hasKey() {
        return this._hasKey;
    }

    set hasKey(value) {
        this._hasKey = value;

        if (this.get_realized())
            this.window.set_cursor(this._hasKey ? this._cursor : null);
    }
});
