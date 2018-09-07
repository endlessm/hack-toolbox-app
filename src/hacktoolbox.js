/* exported HackToolboxMainWindow */

const {GObject} = imports.gi;
const {ToolboxWindowBase} = imports.window;

const DATA_RESOURCE_PATH = 'resource:///com/endlessm/HackToolbox';

var HackToolboxMainWindow = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/hack-toolbox-main-window.ui`,
    Children: [
        'hack-button',
    ],
}, class HackToolboxMainWindow extends ToolboxWindowBase {
});
