/* exported HBLevel1 */

const {GObject, Gtk} = imports.gi;
const {ButtonGroup} = imports.framework.buttonGroup;

var HBLevel1 = GObject.registerClass({
    GTypeName: 'HBLevel1',
    Template: 'resource:///com/endlessm/HackToolbox/hackyballs/level1.ui',
    InternalChildren: [
        'background0',
        'background1',
        'background2',
        'background3',
        'background4',
    ],
}, class HBLevel1 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);
        this._backgroundGroup = new ButtonGroup({
            background0: this._background0,
            background1: this._background1,
            background2: this._background2,
            background3: this._background3,
            background4: this._background4,
        });
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        model.bind_property('backgroundImageIndex', this._backgroundGroup, 'index', flags);
    }
});
