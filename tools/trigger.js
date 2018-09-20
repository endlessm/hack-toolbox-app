const {GLib, Gio} = imports.gi;

if (ARGV.length < 3)
    ARGV[2] = 'flip';

Gio.DBus.session.call_sync('com.endlessm.HackToolbox',
    '/com/endlessm/HackToolbox',
    'org.gtk.Actions', 'Activate',
    new GLib.Variant('(sava{sv})', [
        ARGV[2],
        [new GLib.Variant('(ss)', [ARGV[0], ARGV[1]])],
        {},
    ]),
    null, Gio.DBusCallFlags.NONE, -1, null);
