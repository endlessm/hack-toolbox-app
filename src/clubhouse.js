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
/* exported getDefault */

const {Gio} = imports.gi;

const ClubhouseIface = `
<node>
  <interface name="com.hack_computer.Clubhouse">
    <method name="show">
      <arg type="u" direction="in" name="timestamp"/>
    </method>
    <method name="hide">
      <arg type="u" direction="in" name="timestamp"/>
    </method>
    <method name="getAnimationMetadata">
      <arg type="s" direction="in" name="path"/>
      <arg type="v" direction="out" name="metadata"/>
    </method>
    <method name="recordMetric">
      <arg type="s" direction="in" name="key"/>
      <arg type="v" direction="in" name="payload"/>
      <arg type="a{sv}" direction="in" name="custom"/>
    </method>
    <property name="Visible" type="b" access="read"/>
    <property name="RunningQuest" type="s" access="read"/>
    <property name="SuggestingOpen" type="b" access="read"/>
  </interface>
</node>`;

var getDefault = (function() {
    const ClubhouseProxy = Gio.DBusProxy.makeProxyWrapper(ClubhouseIface);
    let defaultClubhouse;

    return function() {
        if (!defaultClubhouse) {
            defaultClubhouse = new ClubhouseProxy(Gio.DBus.session,
                'com.hack_computer.Clubhouse', '/com/hack_computer/Clubhouse');
        }
        return defaultClubhouse;
    };
}());
