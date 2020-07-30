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
/* exported TopicButton */
const {GObject, Gtk, GLib, Gio} = imports.gi;

const {Lockscreen} = imports.lockscreen;

const TopicIface = `
<node>
  <interface name="com.hack_computer.HackToolbox.Topic">
    <method name="reveal">
      <arg type="b" direction="in" name="revealed"/>
    </method>
    <property name="sensitive" type="b" access="readwrite"/>
    <signal name="clicked">
      <arg type="s" name="button"/>
    </signal>
  </interface>
</node>`;

var TopicButton = GObject.registerClass({
    Properties: {
        id: GObject.ParamSpec.string('id', 'ID', 'Machine-facing topic ID',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
        title: GObject.ParamSpec.string('title', 'Title', 'Topic title',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
        lockscreen: GObject.ParamSpec.boolean('lockscreen', 'lockscreen', 'Topic lockscreen',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, false),
        'icon-name': GObject.ParamSpec.string('icon-name', 'Icon name',
            'Named icon for topic illustration',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
        sensitive: GObject.ParamSpec.boolean('sensitive', 'sensitive',
            'Indicates whether the Topic Button is sensitive',
            GObject.ParamFlags.READWRITE, false),
        revealed: GObject.ParamSpec.boolean('revealed', 'revealed',
            'Indicates whether the Topic is revealed',
            GObject.ParamFlags.READWRITE, false),
    },
    Signals: {
        clicked: {},
    },
}, class TopicButton extends Gtk.Frame {
    _init(props = {}) {
        super._init(props);

        const overlay = new Gtk.Overlay();

        if (this._lockscreen) {
            this.topicLock = new Lockscreen({visible: true});
            overlay.add_overlay(this.topicLock);
            this.topicLock.get_style_context().add_class('topic-lockscreen');
        }

        this._attentionSign = new Gtk.Revealer({
            revealChild: false,
            halign: Gtk.Align.END,
            name: 'attention-sign',
            valign: Gtk.Align.START,
        });
        const attentionIcon = new Gtk.Image({
            iconName: 'error-badge',
            pixelSize: 20,
        });
        this._attentionSign.add(attentionIcon);
        this._attentionSign.get_style_context().add_class('topic-revealer');

        const icon = new Gtk.Image({
            iconName: this._iconName,
            pixelSize: 80,
        });
        const box = new Gtk.Box({
            halign: Gtk.Align.FILL,
            orientation: Gtk.Orientation.VERTICAL,
        });
        const label = new Gtk.Label({
            hexpand: true,
            label: this._title,
        });

        overlay.add_overlay(this._attentionSign);
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

    get lockscreen() {
        return this._lockscreen;
    }

    set lockscreen(value) {
        this._lockscreen = value;
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
        this._attentionSign.revealChild = value;
        this.notify('needs-attention');
    }

    get revealed() {
        return this._revealed;
    }

    set revealed(value) {
        if ('_revealed' in this && this._revealed === value)
            return;

        this._revealed = value;
        this.notify('revealed');
    }

    get sensitive() {
        return this._sensitive;
    }

    set sensitive(value) {
        if ('_sensitive' in this && this._sensitive === value)
            return;

        this._sensitive = value;
        this.notify('sensitive');

        if (!this._sensitive)
            this.get_style_context().add_class('insensitive');
        else if (this._sensitive)
            this.get_style_context().remove_class('insensitive');
    }

    dbusRegister(appId) {
        const objPath = Gio.Application.get_default().get_dbus_object_path();
        const winName = appId.replace(/\./gi, '_');
        this.objectPath = `${objPath}/window/${winName}/topic/${this._id}`;
        this.address = `com.hack_computer.HackToolbox.window.${winName}.topic.${this._id}`;
        this._dbus = Gio.DBusExportedObject.wrapJSObject(TopicIface, this);
        try {
            this._dbus.export(Gio.DBus.session, this.objectPath);
        } catch (e) {
            logError(e);
        }
        this.connect('clicked', this._handleClickedSignal.bind(this));
    }

    _handleClickedSignal(button) {
        const variant = new GLib.Variant('(s)', button.id);
        this._dbus.emit_signal(
            'clicked',
            variant);
    }

    // D-Bus implementation
    reveal(isRevealed) {
        this.set_property('revealed', isRevealed);
    }

    dbusUnregister() {
        this._dbus.unexport();
    }
});
