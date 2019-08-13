/* exported HUControlPanel */

const {GObject, Gtk} = imports.gi;

var HUControlPanel = GObject.registerClass({
    GTypeName: 'HUControlPanel',
    Template: 'resource:///com/hack_computer/HackToolbox/HackUnlock/controlpanel.ui',
    InternalChildren: [
        'adjustmentAmplitude',
        'adjustmentFrequency',
        'adjustmentPhase',
    ],
}, class HUControlPanel extends Gtk.Grid {
    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        model.bind_property('amplitude', this._adjustmentAmplitude, 'value', flags);
        model.bind_property('frequency', this._adjustmentFrequency, 'value', flags);
        model.bind_property('phase', this._adjustmentPhase, 'value', flags);
    }
});
