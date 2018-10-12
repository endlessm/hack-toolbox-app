/* exported OSControlPanel */

const {GObject, Gtk} = imports.gi;

var OSControlPanel = GObject.registerClass({
    GTypeName: 'OSControlPanel',
    Template: 'resource:///com/endlessm/HackToolbox/OperatingSystemApp/controlpanel.ui',
}, class OSControlPanel extends Gtk.Box {
});

