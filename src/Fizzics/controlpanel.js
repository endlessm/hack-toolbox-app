/* exported FizzicsControlPanel */

const {GObject, Gtk} = imports.gi;
const {FizzicsLevel1} = imports.Fizzics.level1;
const {FizzicsLevel2} = imports.Fizzics.level2;
const {Lockscreen} = imports.lockscreen;

var FizzicsControlPanel = GObject.registerClass({
    GTypeName: 'FizzicsControlPanel',
    Template: 'resource:///com/endlessm/HackToolbox/Fizzics/controlpanel.ui',
    InternalChildren: [
        'panelLevel1',
        'panelLevel2',
    ],
}, class FizzicsControlPanel extends Gtk.Box {
    _init(props = {}) {
        super._init(props);

        this._level1 = new FizzicsLevel1({visible: true});
        this._level2 = new FizzicsLevel2({visible: true});
        this._level2lock = new Lockscreen({visible: false});

        this._level2lock.add(this._level2);
        this._panelLevel1.add(this._level1);
        this._panelLevel2.add(this._level2lock);
        this._level2lock.show_all();

        this._level2lock.bind_property('locked',
            this._level2, 'update-sound-enabled',
            GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.INVERT_BOOLEAN);
    }

    bindModel(model) {
        this._level1.bindModel(model);
        this._level2.bindModel(model);
        this._model = model;
    }

    bindWindow(win) {
        win.lockscreen.key = 'item.key.fizzics.1';
        win.lockscreen.lock = 'lock.fizzics.1';
        this._level2lock.key = 'item.key.fizzics.2';
        this._level2lock.lock = 'lock.fizzics.2';
    }
});
