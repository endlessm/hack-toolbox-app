const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

log(ARGV[0]);
let bus = Gio.bus_get_sync(Gio.BusType.SESSION, null);
let proxy = bus.call_sync('com.endlessm.HackToolbox',
                          '/com/endlessm/HackToolbox',
                          'org.gtk.Actions',
                          'Activate',
                          new GLib.Variant('(sava{sv})', [
                              'show-for-dbus-object',
                              [new GLib.Variant('(ss)', [ARGV[0], ARGV[1]])],
                              {}
                          ]),
                          null,
                          Gio.DBusCallFlags.NONE,
                          -1,
                          null);
