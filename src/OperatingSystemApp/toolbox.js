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

        this.connect('reset', () => {
            this._controlPanel.reset();
        });
    }

    bindWindow(win) {
        win.lockscreen.key = 'item.key.OperatingSystemApp.1';
        this._controlPanel.wobblyLock.key = 'item.key.OperatingSystemApp.2';
        this._controlPanel.codeLock.key = 'item.key.OperatingSystemApp.3';
        win.get_style_context().add_class('OperatingSystemApp');
    }
});

