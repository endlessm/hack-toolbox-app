/* exported FizzicsLevel1 */

const {GObject, Gtk} = imports.gi;

const {FizzicsSkinImage} = imports.Fizzics.skinImage;
const {FizzicsObjectEditor} = imports.Fizzics.objectEditor;
const {PopupMenu} = imports.popupMenu;
const {Section} = imports.section;

GObject.type_ensure(Section.$gtype);

var FizzicsLevel1 = GObject.registerClass({
    GTypeName: 'FizzicsLevel1',
    Template: 'resource:///com/endlessm/HackToolbox/Fizzics/level1.ui',
    InternalChildren: [
        'buttonBackground',
        'buttonDrag',
        'buttonShoot',
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
            {'resource-path': '/com/endlessm/HackToolbox/Fizzics/backgrounds'});
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

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        model.bind_property('backgroundImageIndex', this._menuBackground, 'index', flags);
        model.bind_property('moveToolActive', this._buttonDrag, 'active', flags);
        model.bind_property('flingToolActive', this._buttonShoot, 'active', flags);
        model.bind_property('createToolActive', this._buttonAdd, 'active', flags);
        model.bind_property('deleteToolActive', this._buttonDelete, 'active', flags);
        model.bind_property('imageIndex-0', this._image0, 'index', flags);
        model.bind_property('imageIndex-1', this._image1, 'index', flags);
        model.bind_property('imageIndex-2', this._image2, 'index', flags);
        model.bind_property('imageIndex-3', this._image3, 'index', flags);
        model.bind_property('imageIndex-4', this._image4, 'index', flags);
        this._bindModelToEditor(model, 0);
        this._bindModelToEditor(model, 1);
        this._bindModelToEditor(model, 2);
        this._bindModelToEditor(model, 3);
        this._bindModelToEditor(model, 4);
    }
});
