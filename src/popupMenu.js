/* exported PopupMenu */
const {GObject, Gtk} = imports.gi;

var PopupMenu = GObject.registerClass({
    Properties: {
        value: GObject.ParamSpec.string('value', 'Value', '',
            GObject.ParamFlags.READWRITE, ''),
    },
}, class PopupMenu extends GObject.Object {
    _init(button, groupDef, ItemClass, itemProp, itemExtraProps, props = {}) {
        const entries = Object.entries(groupDef);
        this._enumMap = new Map(entries);
        const [[defaultKey, defaultValue]] = entries;
        this._value = defaultKey;

        this._button = button;
        const selectedProps = {[itemProp]: defaultValue, visible: true};
        Object.assign(selectedProps, itemExtraProps);
        this._selected = new ItemClass(selectedProps);
        this._button.add(this._selected);

        super._init(props);

        this._menu = new Gtk.Popover();
        const [minChildrenPerLine, maxChildrenPerLine] = this._getChildrenPerLine();
        this._choices = new Gtk.FlowBox({
            homogeneous: true,
            rowSpacing: 6,
            columnSpacing: 6,
            minChildrenPerLine,
            maxChildrenPerLine,
            visible: true,
        });
        this._button.popover = this._menu;

        this._menu.add(this._choices);
        entries.forEach(([enumValue, propValue]) => {
            const choiceProps = {[itemProp]: propValue, visible: true};
            Object.assign(choiceProps, itemExtraProps);
            const choice = new ItemClass(choiceProps);
            choice._enumValue = enumValue;
            this._choices.add(choice);
        });

        this._choices.connect('child-activated', this._onChoicesActivated.bind(this));

        this._itemProp = itemProp;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (this._value === value)
            return;
        this._selected[this._itemProp] = this._enumMap.get(value);
        this._value = value;
        this.notify('value');
    }

    get validIds() {
        return [...this._enumMap.keys()];
    }

    _getChildrenPerLine() {
        const nchildren = this._enumMap.size;
        if (nchildren >= 16)
            return [4, 4];
        if (nchildren >= 12)
            return [3, 4];
        if (nchildren >= 9)
            return [3, 3];
        if (nchildren >= 4)
            return [2, 3];
        return [2, 2];
    }

    _onChoicesActivated(widget, child) {
        const choice = child.get_child();  // child of the FlowBoxChild
        this.value = choice._enumValue;
        this._menu.popdown();
    }
});
