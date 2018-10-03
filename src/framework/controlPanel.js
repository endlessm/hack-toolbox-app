/* exported RaControlPanel */

const {GObject, Gtk} = imports.gi;

const {FrameworkLevel1} = imports.framework.level1;
const {FrameworkLevel2} = imports.framework.level2;
const {FrameworkLevel3} = imports.framework.level3;
const {Lockscreen} = imports.lockscreen;

var RaControlPanel = GObject.registerClass(class RaControlPanel extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        this._level1 = new FrameworkLevel1({visible: true});
        this.attach(this._level1, 0, 0, 1, 1);

        this._level2lock = new Lockscreen({visible: true});
        this._level2 = new FrameworkLevel2({visible: true});
        this._level2lock.add(this._level2);
        this.attach(this._level2lock, 1, 0, 1, 1);

        this._level3lock = new Lockscreen({visible: false});
        this._level3 = new FrameworkLevel3({visible: true});
        this._level3lock.add(this._level3);
        this.attach(this._level3lock, 2, 0, 1, 1);
    }

    bindModel(model) {
        this._level1.bindModel(model);
        this._level2.bindModel(model);
        this._level3.bindModel(model);
    }

    bindWindow(win) {
        win.connect('unlock-state-changed', () => {
            const [, l2, l3] = win.getUnlockState();
            if (l2) {
                this._level2lock.locked = false;
                this._level3lock.show_all();
            }
            if (l3)
                this._level3lock.locked = false;
        });
    }
});
