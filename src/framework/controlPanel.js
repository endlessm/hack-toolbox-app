/* exported RaControlPanel */

const {GObject, Gtk} = imports.gi;

const {FrameworkLevel1} = imports.framework.level1;
const {FrameworkLevel2} = imports.framework.level2;
const {FrameworkLevel3} = imports.framework.level3;

var RaControlPanel = GObject.registerClass(class RaControlPanel extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);
        this._level1 = new FrameworkLevel1({visible: true});
        this.attach(this._level1, 0, 0, 1, 1);
        this._level2 = new FrameworkLevel2({visible: true});
        this.attach(this._level2, 1, 0, 1, 1);
        this._level3 = new FrameworkLevel3({visible: true});
        this.attach(this._level3, 2, 0, 1, 1);
    }

    bindModel(model) {
        this._level1.bindModel(model);
        this._level2.bindModel(model);
        this._level3.bindModel(model);
    }
});
