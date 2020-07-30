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
/* exported WobblyPanel */

const {GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;
const {OSWobblyModel} = imports.OperatingSystemApp.oswobblymodel;
const {Section} = imports.section;
const {WobblyLockscreen} = imports.OperatingSystemApp.wobblyLockscreen;

GObject.type_ensure(Codeview.$gtype);
GObject.type_ensure(Section.$gtype);
GObject.type_ensure(WobblyLockscreen.$gtype);

var WobblyPanel = GObject.registerClass({
    GTypeName: 'WobblyPanel',
    Template: 'resource:///com/hack_computer/HackToolbox/OperatingSystemApp/wobblypanel.ui',
    Children: [
        'wobblyLock',
    ],
    InternalChildren: [
        'codeLock',
        'codeview',
        'frictionAdjustment',
        'movementAdjustment',
        'slowdownAdjustment',
        'springAdjustment',
        'wobblyCheck',
    ],
}, class WobblyPanel extends Gtk.Grid {
    _init(props = {}) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;

        /* Setup icons path */
        var theme = Gtk.IconTheme.get_default();
        theme.add_resource_path('/com/hack_computer/HackToolbox/OperatingSystemApp/icons');

        super._init(props);

        // Temporary fix for keeping the toolbox the same height as it was in
        // the old design
        this._codeview.minContentHeight = 424;

        this._wobbly = new OSWobblyModel();
        this._wobbly.bind_property('wobblyEffect', this._wobblyCheck, 'active', flags);
        this._wobbly.bind_property('wobblyObjectMovementRange', this._movementAdjustment,
            'value', flags);
        this._wobbly.bind_property('wobblySlowdownFactor', this._slowdownAdjustment,
            'value', flags);
        this._wobbly.bind_property('wobblySpringFriction', this._frictionAdjustment,
            'value', flags);
        this._wobbly.bind_property('wobblySpringK', this._springAdjustment,
            'value', flags);
    }

    reset() {
        this._wobbly.reset();
    }
});
