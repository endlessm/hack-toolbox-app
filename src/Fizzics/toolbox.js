/* exported FizzicsToolbox */

const {Gio, GLib, GObject} = imports.gi;

const {Toolbox} = imports.toolbox;
const {FizzicsControlPanel} = imports.Fizzics.controlpanel;
const {FizzicsModelGlobal} = imports.Fizzics.model;

var FizzicsToolbox = GObject.registerClass(class FizzicsToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);
        this._model = new FizzicsModelGlobal();
        this._controlPanel = new FizzicsControlPanel({visible: true});
        this._controlPanel.bindModel(this._model);
        this.addTopic('main', 'Tools', 'preferences-other-symbolic', this._controlPanel);
        this.show_all();
        this.selectTopic('main');

        this.connect('reset', () => {
            Gio.DBus.session.call_sync(
                'com.endlessm.Fizzics',
                '/com/endlessm/Fizzics',
                'org.gtk.Actions', 'Activate',
                new GLib.Variant('(sava{sv})', ['reset', [], {}]),
                null, Gio.DBusCallFlags.NONE, -1, null
            );
            this._controlPanel.reset();
        });
    }

    bindWindow(win) {
        win.get_style_context().add_class('Fizzics');
        this._controlPanel.bindWindow(win);
    }

    shutdown() {
        super.shutdown();
        this._controlPanel.unbindModel();
    }
});
