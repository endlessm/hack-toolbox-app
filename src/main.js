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
    Gdk: '3.0',
    GdkPixbuf: '2.0',
    Gtk: '3.0',
    Gio: '2.0',
    GLib: '2.0',
    GObject: '2.0',
    Hackable: '0',
    HackToolbox: '0',
});

const {GLib} = imports.gi;
const {HackToolboxApplication} = imports.app;

function main(argv) {
    let app = new HackToolboxApplication();
    if (GLib.getenv('HACK_TOOLBOX_PERSIST'))
        app.hold();
    return app.run(argv);
}
