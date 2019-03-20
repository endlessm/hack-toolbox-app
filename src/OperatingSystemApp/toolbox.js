/* exported OSToolbox */

const {GObject, Gtk} = imports.gi;

const {OSControlPanel} = imports.OperatingSystemApp.controlpanel;
const {OSCursorModel} = imports.OperatingSystemApp.oscursormodel;
const {OSWobblyModel} = imports.OperatingSystemApp.oswobblymodel;
const {Toolbox} = imports.toolbox;
const {WobblyPanel} = imports.OperatingSystemApp.wobblypanel;


var OSToolbox = GObject.registerClass(class OSToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        /* Setup icons path */
        var theme = Gtk.IconTheme.get_default();
        theme.add_resource_path('/com/endlessm/HackToolbox/OperatingSystemApp/icons');

        this._controlPanel = new OSControlPanel({visible: true});
        this.addTopic('main', 'Cursor', 'cursor-symbolic', this._controlPanel);
        const cursorModel = new OSCursorModel();
        this._controlPanel.bindModel(cursorModel);
        this.show_all();

        this._wobblyPanel = new WobblyPanel({visible: true});
        this.addTopic('wobblyPanel', 'Windows', 'wobbly-windows-symbolic', this._wobblyPanel);
        const wobblyModel = new OSWobblyModel();
        this._wobblyPanel.bindModel(wobblyModel);
        this.showTopic('wobblyPanel');

        this.connect('reset', () => {
            this._controlPanel.reset();
            this._wobblyPanel.reset();
        });
    }

    bindWindow(win) {
        win.lockscreen.key = 'item.key.OperatingSystemApp.1';
        win.lockscreen.lock = 'lock.OperatingSystemApp.1';
        this._wobblyPanel.wobblyLock.key = 'item.key.OperatingSystemApp.2';
        this._wobblyPanel.wobblyLock.lock = 'lock.OperatingSystemApp.2';
        this._controlPanel.codeLock.key = 'item.key.OperatingSystemApp.3';
        this._controlPanel.codeLock.lock = 'lock.OperatingSystemApp.3';
        this._wobblyPanel._codeLock.key = 'item.key.OperatingSystemApp.3';
        this._wobblyPanel._codeLock.lock = 'lock.OperatingSystemApp.3';
        win.get_style_context().add_class('OperatingSystemApp');
    }
});

