/* exported HBControlPanel */

const {GObject, Gtk} = imports.gi;
const {HBLevel1} = imports.hackyballs.level1;
const {HBLevel2} = imports.hackyballs.level2;
const {HBLevel3} = imports.hackyballs.level3;
const {Lockscreen} = imports.lockscreen;

var HBControlPanel = GObject.registerClass({
    GTypeName: 'HBControlPanel',
    Template: 'resource:///com/endlessm/HackToolbox/hackyballs/controlpanel.ui',
    InternalChildren: [
        'panelLevel1',
        'panelLevel2',
        'panelLevel3',
    ],
}, class HBControlPanel extends Gtk.Box {
    _init(props = {}) {
        super._init(props);

        this._level1 = new HBLevel1({visible: true});
        this._level2 = new HBLevel2({visible: true});
        this._level3 = new HBLevel3({visible: true});
        this._level2lock = new Lockscreen({visible: true});
        this._level3lock = new Lockscreen({visible: false});

        this._level2lock.add(this._level2);
        this._level3lock.add(this._level3);
        this._panelLevel1.add(this._level1);
        this._panelLevel2.add(this._level2lock);
        this._panelLevel3.add(this._level3lock);
    }

    bindModel(model) {
        this._level1.bindModel(model);
        this._level2.bindModel(model);
        this._level3.bindModel(model);
        this._model = model;
    }

    _onUnlockStateChanged(win) {
        const [, l2, l3] = win.getUnlockState();
        if (l2) {
            this._level2lock.locked = false;
            this._level3lock.show_all();
        }
        if (l3)
            this._level3lock.locked = false;
    }

    bindWindow(win) {
        win.connect('unlock-state-changed', this._onUnlockStateChanged.bind(this));
        this._onUnlockStateChanged(win);
    }
});
