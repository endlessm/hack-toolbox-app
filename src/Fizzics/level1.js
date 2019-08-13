/* exported FizzicsLevel1 */

const {GObject, Gtk} = imports.gi;

const {FizzicsSkinImage} = imports.Fizzics.skinImage;
const {FizzicsObjectEditor} = imports.Fizzics.objectEditor;
const {PopupMenu} = imports.popupMenu;
const {Section} = imports.section;

GObject.type_ensure(Section.$gtype);

var FizzicsLevel1 = GObject.registerClass({
    GTypeName: 'FizzicsLevel1',
    Template: 'resource:///com/hack_computer/HackToolbox/Fizzics/level1.ui',
    InternalChildren: [
        'buttonBackground',
        'buttonDrag',
        'buttonFling',
        'buttonAdd',
        'buttonDelete',
        'tab0',
        'tab0Image',
        'tab1',
        'tab1Image',
        'tab2',
        'tab2Image',
        'tab3',
        'tab3Image',
        'tab4',
        'tab4Image',
    ],
}, class FizzicsLevel1 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        const indices = Array.from({length: 3}, (v, i) => i);
        this._menuBackground = new PopupMenu(this._buttonBackground, indices,
            FizzicsSkinImage, 'index',
            {'resource-path': '/com/hack_computer/HackToolbox/Fizzics/backgrounds'});
        this._addTabForIndex(0);
        this._addTabForIndex(1);
        this._addTabForIndex(2);
        this._addTabForIndex(3);
        this._addTabForIndex(4);
    }

    _addTabForIndex(index) {
        this[`_editor${index}`] = new FizzicsObjectEditor({visible: true});
        this[`_image${index}`] = new FizzicsSkinImage({visible: true, pixels: 32});
        this[`_tab${index}`].add(this[`_editor${index}`]);
        this[`_tab${index}Image`].add(this[`_image${index}`]);
    }

    _bindModelToEditor(model, index) {
        this[`_editor${index}`].bindModel(
            model, {
                radius: `radius-${index}`,
                gravity: `gravity-${index}`,
                collision: `collision-${index}`,
                friction: `friction-${index}`,
                physics: `usePhysics-${index}`,
                social0: `socialForce-${index}-0`,
                social1: `socialForce-${index}-1`,
                social2: `socialForce-${index}-2`,
                social3: `socialForce-${index}-3`,
                social4: `socialForce-${index}-4`,
                badSFX: `deathSoundBad-${index}`,
                badVFX: `deathVisualBad-${index}`,
                goodSFX: `deathSoundGood-${index}`,
                goodVFX: `deathVisualGood-${index}`,
                skin: `imageIndex-${index}`,
                skin0: 'imageIndex-0',
                skin1: 'imageIndex-1',
                skin2: 'imageIndex-2',
                skin3: 'imageIndex-3',
                skin4: 'imageIndex-4',
            }
        );
    }

    _unbindModelToEditor(index) {
        this[`_editor${index}`].unbindModel();
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;

        const bindingInfo = [
            ['backgroundImageIndex', this._menuBackground, 'index'],
            ['moveToolActive', this._buttonDrag, 'active'],
            ['flingToolActive', this._buttonFling, 'active'],
            ['createToolActive', this._buttonAdd, 'active'],
            ['deleteToolActive', this._buttonDelete, 'active'],
            ['imageIndex-0', this._image0, 'index'],
            ['imageIndex-1', this._image1, 'index'],
            ['imageIndex-2', this._image2, 'index'],
            ['imageIndex-3', this._image3, 'index'],
            ['imageIndex-4', this._image4, 'index'],
        ];
        this._bindings = bindingInfo.map(([prop, target, targetProp]) =>
            model.bind_property(prop, target, targetProp, flags));

        this._bindModelToEditor(model, 0);
        this._bindModelToEditor(model, 1);
        this._bindModelToEditor(model, 2);
        this._bindModelToEditor(model, 3);
        this._bindModelToEditor(model, 4);
    }

    unbindModel() {
        if (this._bindings) {
            this._bindings.forEach(binding => binding.unbind());
            this._bindings = null;
        }

        this._unbindModelToEditor(0);
        this._unbindModelToEditor(1);
        this._unbindModelToEditor(2);
        this._unbindModelToEditor(3);
        this._unbindModelToEditor(4);
    }
});
