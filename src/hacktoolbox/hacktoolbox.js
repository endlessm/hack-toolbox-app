/* exported DefaultHackToolbox */

const {GObject} = imports.gi;

const {Toolbox} = imports.toolbox;

const DATA_RESOURCE_PATH = 'resource:///com/endlessm/HackToolbox';

var DefaultHackToolbox = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/hacktoolbox/toolbox.ui`,
}, class DefaultHackToolbox extends Toolbox {
    // Intended to be implemented by other toolbox classes, if they need to
    // implement any behaviour before flipping back to the app
    applyChanges(busName, objectPath) {
        void (this, busName, objectPath);
        return Promise.resolve();
    }

    // Intended to be implemented by other toolbox classes, if they need to
    // connect to the window's unlock state.
    bindWindow(win) {
        win.get_style_context().add_class('default');
        void (this, win);
    }
});
