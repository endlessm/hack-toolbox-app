const {GLib, Gio} = imports.gi;

Gio.DBus.session.call_sync('com.endlessm.HackToolbox',
    '/com/endlessm/HackToolbox',
    'org.gtk.Actions', 'Activate',
    new GLib.Variant('(sava{sv})', [
        'flip',
        [new GLib.Variant('(ss)', [ARGV[0], ARGV[1]])],
        {},
    ]),
    null, Gio.DBusCallFlags.NONE, -1, null);
