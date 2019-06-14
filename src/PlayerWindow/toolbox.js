/* exported PlayerWindowToolbox */

const {Gio, GLib, GObject, Gtk} = imports.gi;

const {Toolbox} = imports.toolbox;
const {FizzicsControlPanel} = imports.Fizzics.controlpanel;
const {FizzicsModelGlobal} = imports.Fizzics.model;

Gio.Resource.load(
    '/app/share/hack-sound-server-tools/hack-sound-server-tools.gresource')._register();
imports.searchPath.unshift('resource:///com/endlessm/hacksoundserver/tools/js');
const {PlayerBox} = imports.hacksoundserver.tools.playerwindow.box;


var PlayerWindowToolbox = GObject.registerClass(class PlayerWindowToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        this._playerbox = new PlayerBox('com.endlessm.HackToolbox');
        this.addTopic('player', 'Player', 'accessories-text-editor-symbolic',
                      this._playerbox);
        this.showTopic('player');
        this.selectTopic('player');

        this.show_all();
    }

    bindWindow(win) {
        win.get_style_context().add_class('PlayerWindow');
        win.lockscreen.locked = false;
    }
});
