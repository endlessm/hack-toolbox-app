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
/* exported OSWobblyModel */

const {Gio, GObject} = imports.gi;
const {OSModel} = imports.OperatingSystemApp.osmodel;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var OSWobblyModel = GObject.registerClass({
    Properties: {
        wobblyEffect: GObject.ParamSpec.boolean(
            'wobblyEffect', 'Wobbly Effect', '',
            _propFlags, false),
        wobblyObjectMovementRange: GObject.ParamSpec.double(
            'wobblyObjectMovementRange', 'Wobbly Object Movement Range', '',
            _propFlags, 10.0, 500.0, 100.0),
        wobblySlowdownFactor: GObject.ParamSpec.double(
            'wobblySlowdownFactor', 'Wobbly Slowdown Factor', '',
            _propFlags, 1.0, 5.0, 1.0),
        wobblySpringFriction: GObject.ParamSpec.double(
            'wobblySpringFriction', 'Wobbly Spring Friction', '',
            _propFlags, 2.0, 10.0, 3.0),
        wobblySpringK: GObject.ParamSpec.double(
            'wobblySpringK', 'Wobbly Spring K', '',
            _propFlags, 2.0, 10.0, 8.0),
    },
}, class OSWobblyModel extends OSModel {
    _init() {
        super._init();

        // Compatible with EOS <= 3.7
        if (this._getShellVersion() < '3.36') {
            var settings = new Gio.Settings({
                schemaId: 'org.gnome.shell',
                path: '/org/gnome/shell/',
            });

            this.bindSetting(settings, 'wobbly-effect', 'wobblyEffect');
            this.bindSetting(settings,
                'wobbly-object-movement-range', 'wobblyObjectMovementRange');
            this.bindSetting(settings, 'wobbly-slowdown-factor', 'wobblySlowdownFactor');
            this.bindSetting(settings, 'wobbly-spring-friction', 'wobblySpringFriction');
            this.bindSetting(settings, 'wobbly-spring-k', 'wobblySpringK');
        } else {
            this.bindHackProp('WobblyEffect', 'wobblyEffect');
            this.bindHackProp('WobblyObjectMovementRange', 'wobblyObjectMovementRange');
            this.bindHackProp('WobblySlowdownFactor', 'wobblySlowdownFactor');
            this.bindHackProp('WobblySpringFriction', 'wobblySpringFriction');
            this.bindHackProp('WobblySpringK', 'wobblySpringK');
        }
    }
});
