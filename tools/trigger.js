const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

log(ARGV[0]);
let bus = Gio.bus_get_sync(Gio.BusType.SESSION, null);
let proxy = bus.call_sync('com.endlessm.CodingAnimationsTweak',
                          '/com/endlessm/CodingAnimationsTweak',
                          'org.gtk.Actions',
                          'Activate',
                          new GLib.Variant('(sava{sv})', [
                              'show-for-surface-path',
                              [new GLib.Variant('s', ARGV[0])],
                              {}
                          ]),
                          null,
                          Gio.DBusCallFlags.NONE,
                          -1,
                          null);
