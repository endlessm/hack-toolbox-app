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

        this._level2lock = new Lockscreen({visible: true, hexpand: true});
        this._level2 = new FrameworkLevel2({visible: true, hexpand: true});
        this._level2lock.add(this._level2);
        this.attach(this._level2lock, 0, 1, 1, 1);

        this._level3lock = new Lockscreen({visible: false});
        this._level3 = new FrameworkLevel3({visible: true});
        this._level3lock.add(this._level3);
        this.attach(this._level3lock, 1, 0, 1, 2);

        // Visually align the widths of the labels in each column of the top and
        // bottom panels.
        const topColumn1Label = this._level1.leftInnerGrid.get_child_at(0, 0);
        const bottomColumn1Label = this._level2.leftInnerGrid.get_child_at(0, 0);
        const column1Group = new Gtk.SizeGroup({
            mode: Gtk.SizeGroupMode.HORIZONTAL,
        });
        column1Group.add_widget(topColumn1Label);
        column1Group.add_widget(bottomColumn1Label);

        const topColumn2Label = this._level1.rightInnerGrid.get_child_at(0, 0);
        const bottomColumn2Label = this._level2.rightInnerGrid.get_child_at(0, 0);
        const column2Group = new Gtk.SizeGroup({
            mode: Gtk.SizeGroupMode.HORIZONTAL,
        });
        column2Group.add_widget(topColumn2Label);
        column2Group.add_widget(bottomColumn2Label);
    }

    bindModel(model) {
        this._level1.bindModel(model);
        this._level2.bindModel(model);
        this._level3.bindModel(model);
    }

    bindWindow(win) {
        this._level2lock.connect('notify::locked', () => {
            if (!this._level2lock.locked)
                this._level3lock.show_all();
        });

        win.lockscreen.key = 'item.key.framework.1';
        this._level2lock.key = 'item.key.framework.2';
        this._level3lock.key = 'item.key.framework.3';
    }
});
