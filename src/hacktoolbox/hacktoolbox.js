/* exported DefaultHackToolbox */

const {GObject, Gtk} = imports.gi;

const DATA_RESOURCE_PATH = 'resource:///com/endlessm/HackToolbox';

var DefaultHackToolbox = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/hacktoolbox/toolbox.ui`,
}, class DefaultHackToolbox extends Gtk.Box {
    // Intended to be implemented by other toolbox classes, if they need to
    // implement any behaviour before flipping back to the app
    applyChanges(busName, objectPath) {
        void (this, busName, objectPath);
        return Promise.resolve();
    }

    // Intended to be implemented by other toolbox classes, if they need to
    // connect to the window's unlock state.
    bindWindow(win) {
        void (this, win);
    }
});
