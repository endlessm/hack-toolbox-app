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
/* exported Toolbox */

const {GObject, Gtk} = imports.gi;
const Gettext = imports.gettext;

const {ResetButton} = imports.resetButton;
const {TopicButton} = imports.topicButton;
const Utils = imports.utils;

const _ = Gettext.gettext;

const SoundServer = imports.soundServer;

var Toolbox = GObject.registerClass({
    CssName: 'toolbox',
    Properties: {
        title: GObject.ParamSpec.string('title', 'Title', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            _('Hack')),
    },
    Signals: {
        reset: {},
    },
}, class Toolbox extends Gtk.Grid {
    _init(appId, props = {}) {
        super._init(props);
        this.appId = appId;
        const leftColumn = new Gtk.Grid({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.FILL,
        });
        leftColumn.get_style_context().add_class('left-column');

        const masthead = new Gtk.Grid();
        masthead.get_style_context().add_class('masthead');

        const appIcon = new Gtk.Image();
        appIcon.get_style_context().add_class('icon');
        const appNameLabel = new Gtk.Label({halign: Gtk.Align.START});
        appNameLabel.get_style_context().add_class('name');

        const appInfo = Utils.appInfoForAppId(appId);
        if (appInfo) {
            const icon = appInfo.get_icon();
            if (icon)
                appIcon.set_from_gicon(icon, Gtk.IconSize.DIALOG);
            else
                appIcon.set_from_icon_name('user-available', Gtk.IconSize.DIALOG);
            appNameLabel.label = appInfo.get_name();
        } else {
            // Application not installed, this is not expected during normal
            // use, but set some defaults in case it happens during development
            appIcon.set_from_icon_name('user-available', Gtk.IconSize.DIALOG);
            appNameLabel.label = 'Toolbox';
        }
        appIcon.pixelSize = 48;
        this._infoLabel = new Gtk.Label({halign: Gtk.Align.START});
        this._infoLabel.get_style_context().add_class('info');
        const buttonReset = new ResetButton();

        masthead.attach(appIcon, 0, 0, 1, 2);
        masthead.attach(appNameLabel, 1, 0, 1, 1);
        masthead.attach(this._infoLabel, 1, 1, 1, 1);
        masthead.attach(buttonReset, 0, 2, 2, 1);

        const separator = new Gtk.Separator({orientation: Gtk.Orientation.HORIZONTAL});

        const topicsScroll = new Gtk.ScrolledWindow({
            hexpand: true,
            hscrollbarPolicy: Gtk.PolicyType.NEVER,
            minContentWidth: 154,
            overlayScrolling: false,
            vexpand: true,
        });
        this._topicsList = new Gtk.ListBox({
            halign: Gtk.Align.START,
            selectionMode: Gtk.SelectionMode.SINGLE,
        });
        this._topicsList.connect('row-selected', this._onRowSelected.bind(this));
        topicsScroll.add(this._topicsList);

        leftColumn.add(masthead);
        leftColumn.add(separator);
        leftColumn.add(topicsScroll);

        this.attach(leftColumn, 0, 0, 1, 1);

        const headerbar = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});

        const headerGrid = new Gtk.Grid({orientation: Gtk.Orientation.HORIZONTAL});
        headerGrid.get_style_context().add_class('header');
        this._headerImage = new Gtk.Image({pixelSize: 32});
        this._headerLabel = new Gtk.Label();
        headerGrid.add(this._headerImage);
        headerGrid.add(this._headerLabel);

        const minimizeImage = new Gtk.Image({iconName: 'go-previous-symbolic'});
        const buttonMinimize = new Gtk.Button();
        buttonMinimize.get_style_context().add_class('minimize');
        buttonMinimize.add(minimizeImage);

        this._leftStack = new Gtk.Stack({
            transitionType: Gtk.StackTransitionType.CROSSFADE,
            homogeneous: true,
            visible: true,
        });
        this._spinner = new Gtk.Spinner({active: false, visible: true});
        this._leftStack.add_named(this._spinner, 'busy');
        this._leftStack.add_named(buttonMinimize, 'normal');
        this._leftStack.visibleChildName = 'normal';

        headerbar.set_center_widget(headerGrid);
        headerbar.pack_end(this._leftStack, false, false, 0);
        headerbar.show_all();

        this._topicsStack = new Gtk.Stack({
            transitionType: Gtk.StackTransitionType.CROSSFADE,
        });

        const toolboxPanel = new Gtk.Grid({orientation: Gtk.Orientation.VERTICAL});
        toolboxPanel.get_style_context().add_class('panel');
        toolboxPanel.add(headerbar);
        toolboxPanel.add(this._topicsStack);

        this._revealer = new Gtk.Revealer({
            revealChild: true,
            transitionType: Gtk.RevealerTransitionType.SLIDE_RIGHT,
        });
        this._revealer.add(toolboxPanel);
        this.attach(this._revealer, 1, 0, 1, 1);

        buttonMinimize.connect('clicked', this._onMinimize.bind(this));
        buttonReset.connect('clicked', this._onResetClicked.bind(this));
        this.setBusy(false);
    }

    addTopic(id, title, iconName, widget, lockscreen = false, sensitive = true) {
        const topic = new TopicButton({id, title, iconName, lockscreen, sensitive});
        this._topicsList.add(topic);

        if (GObject.Object.find_property.call(widget.constructor, 'needs-attention')) {
            widget.bind_property('needs-attention',
                topic, 'needs-attention', GObject.BindingFlags.SYNC_CREATE);
        }
        topic.connect('notify::revealed', () => {
            this._notifyRevealed(topic, id);
        });

        topic.connect('notify::sensitive', () => {
            this._notifySensitive(topic, id);
        });

        topic.dbusRegister(this.appId);

        widget.show_all();  // show_all() only propagates to current stack page
        this._topicsStack.add_titled(widget, id, title);
    }

    addTopicKeys(id, keyName, lockName) {
        const [, topic] = this._findTopic(id);
        topic.topicLock.key = keyName;
        topic.topicLock.lock = lockName;
        topic.topicLock._playbin.connect('done', () => {
            this.selectTopic(id);
        });
    }

    _notifyRevealed(topic, id) {
        if (topic.revealed) {
            this.revealTopic(id);
            this.selectTopic(id);
        } else {
            this.hideTopic(id);
        }
    }

    _findTopic(id) {
        const rows = this._topicsList.get_children();
        const topicRow = rows.find(row => row.get_child().id === id);
        const topic = topicRow.get_child();
        return [topicRow, topic];
    }

    hideTopic(id) {
        const [topicRow, topic] = this._findTopic(id);

        if (this._topicsList.get_selected_row() === topicRow)
            this._topicsList.unselect_row(topicRow);

        topicRow.noShowAll = true;
        topicRow.hide();
        topic.get_style_context().remove_class('reveal');
    }

    selectTopic(id) {
        const [topicRow] = this._findTopic(id);
        this._topicsList.select_row(topicRow);
    }

    revealTopic(id) {
        const [topicRow, topic] = this._findTopic(id);
        if (!topicRow.visible) {
            const sound = SoundServer.getDefault();
            sound.play('hack-toolbox/topic/show');
        }
        topicRow.noShowAll = false;
        topicRow.show_all();
        topic.get_style_context().add_class('reveal');  // animates once
    }

    isTopicVisible(id) {
        const [topicRow] = this._findTopic(id);
        return topicRow.visible;
    }

    showTopic(id) {
        const [topicRow] = this._findTopic(id);

        topicRow.noShowAll = false;
        topicRow.show_all();
    }

    _onRowSelected(list, row) {
        if (row === null) {
            this._setMinimized(true);
            return;
        }

        const topic = row.get_child();
        if (topic.sensitive) {
            this._headerLabel.label = topic.title;
            this._headerImage.iconName = topic.icon_name;
            this._topicsStack.visibleChildName = topic.id;
            this._setMinimized(false);
        }
        topic.emit('clicked');
    }

    _onResetClicked() {
        const sound = SoundServer.getDefault();
        sound.play('hack-toolbox/reset/click');
        this.emit('reset');
    }

    _onMinimize() {
        this._topicsList.select_row(null);
    }

    _setMinimized(minimized) {
        if (this._revealer.revealChild === !minimized)
            return;
        this._revealer.revealChild = !minimized;
        SoundServer.getDefault().play(`hack-toolbox/${minimized ? '' : 'un'}minimize`);
    }

    setBusy(value) {
        this._leftStack.visibleChildName = value ? 'busy' : 'normal';
        this._spinner.active = value;
    }

    setInfo(text) {
        this._infoLabel.label = text;
    }

    _notifySensitive(topic, id) {
        const child = this._topicsStack.get_child_by_name(id);
        child.sensitive = topic.sensitive;
        this.minimizeButton = this._leftStack.get_child_by_name('normal');
        this.minimizeButton.sensitive = topic.sensitive;
    }

    // Can be overridden by subclasses to do any work on window close
    shutdown() {
        this._topicsList.get_children().forEach(row => {
            const topic = row.get_child();
            topic.dbusUnregister();
        });
    }
});
