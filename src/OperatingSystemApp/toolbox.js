/* exported OSToolbox */

const {GObject} = imports.gi;
const {Toolbox} = imports.toolbox;
const {OSControlPanel} = imports.OperatingSystemApp.controlpanel;

var OSToolbox = GObject.registerClass(class OSToolbox extends Toolbox {
    _init(props = {}) {
        super._init(props);
        this._controlPanel = new OSControlPanel({visible: true});
        this.add(this._controlPanel);
        this.show_all();
    }

    bindWindow(win) {
        void (this, win);
    }
});

