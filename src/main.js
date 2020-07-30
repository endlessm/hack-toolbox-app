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
/* global pkg */
/* exported main */
// src/main.js
//
// Copyright (c) 2018 Endless Mobile Inc.
//
// This file is the file first run by the entrypoint to the
// hacker-app package.
//
pkg.initGettext();
pkg.initFormat();
pkg.require({
    EosMetrics: '0',
    Gdk: '3.0',
    GdkPixbuf: '2.0',
    Gtk: '3.0',
    Gio: '2.0',
    GLib: '2.0',
    GObject: '2.0',
    HackToolbox: '0',
});

const {GLib} = imports.gi;
const {HackToolboxApplication} = imports.app;

function main(argv) {
    const app = new HackToolboxApplication();
    if (GLib.getenv('HACK_TOOLBOX_PERSIST'))
        app.hold();
    return app.run(argv);
}
