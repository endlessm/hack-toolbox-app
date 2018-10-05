/* exported HBSliders */

const {GObject, Gtk} = imports.gi;

var HBSliders = GObject.registerClass({
    GTypeName: 'HBSliders',
    Template: 'resource:///com/endlessm/HackToolbox/hackyballs/sliders.ui',
    InternalChildren: [
        'adjustmentRadius',
        'adjustmentGravity',
        'adjustmentCollision',
        'adjustmentFriction',
        'adjustmentSocial0',
        'adjustmentSocial1',
        'adjustmentSocial2',
    ],
}, class HBSliders extends Gtk.Grid {
    bindModel(model, map) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        model.bind_property(map['radius'], this._adjustmentRadius, 'value', flags);
        model.bind_property(map['gravity'], this._adjustmentGravity, 'value', flags);
        model.bind_property(map['collision'], this._adjustmentCollision, 'value', flags);
        model.bind_property(map['friction'], this._adjustmentFriction, 'value', flags);
        model.bind_property(map['social0'], this._adjustmentSocial0, 'value', flags);
        model.bind_property(map['social1'], this._adjustmentSocial1, 'value', flags);
        model.bind_property(map['social2'], this._adjustmentSocial2, 'value', flags);
    }
});
