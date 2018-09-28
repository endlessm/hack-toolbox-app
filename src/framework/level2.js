/* exported FrameworkLevel2 */

const {GObject, Gtk} = imports.gi;
const {ButtonGroup} = imports.framework.buttonGroup;

var FrameworkLevel2 = GObject.registerClass({
    GTypeName: 'FrameworkLevel2',
    Template: 'resource:///com/endlessm/HackToolbox/framework/level2.ui',
    InternalChildren: ['borderColorButton', 'borderWidthAdjustment',
        'clickSoundDrumKit', 'clickSoundNone', 'clickSoundPiano', 'clickSound3',
        'clickSound4', 'filterBlueprint', 'filterCorduroy', 'filterDisco',
        'filterLensFlare', 'filterNone', 'hoverSoundNone', 'hoverSoundScifi',
        'hoverSound2', 'hoverSound3', 'hoverSound4', 'layoutNest',
        'layoutOverflow', 'layoutPiano', 'layoutTiledGrid', 'layoutWindshield',
        'orderAZ', 'orderOrdered', 'orderRandom', 'orderZA', 'textBubbles',
        'textFlipped', 'textNormal', 'textScrambled', 'textZalgo'],
}, class FrameworkLevel2 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        this._textGroup = new ButtonGroup({
            normal: this._textNormal,
            flipped: this._textFlipped,
            bubbles: this._textBubbles,
            scrambled: this._textScrambled,
            zalgo: this._textZalgo,
        });
        this._orderGroup = new ButtonGroup({
            ordered: this._orderOrdered,
            random: this._orderRandom,
            az: this._orderAZ,
            za: this._orderZA,
        });
        this._filterGroup = new ButtonGroup({
            none: this._filterNone,
            disco: this._filterDisco,
            corduroy: this._filterCorduroy,
            blueprint: this._filterBlueprint,
            lensFlare: this._filterLensFlare,
        });
        this._layoutGroup = new ButtonGroup({
            tiledGrid: this._layoutTiledGrid,
            windshield: this._layoutWindshield,
            piano: this._layoutPiano,
            nest: this._layoutNest,
            overflow: this._layoutOverflow,
        });
        this._hoverSoundGroup = new ButtonGroup({
            none: this._hoverSoundNone,
            scifi: this._hoverSoundScifi,
        });
        this._clickSoundGroup = new ButtonGroup({
            none: this._clickSoundNone,
            piano: this._clickSoundPiano,
            drumkit: this._clickSoundDrumKit,
        });

        // FIXME: Add more sound packs, then rename and unhide these
        [this._hoverSound2, this._hoverSound3, this._hoverSound4,
            this._clickSound3, this._clickSound4]
            .forEach(widget => widget.hide());
    }

    bindModel(model) {
        // Sync some properties from the target to the source, to begin with.
        // The default value of a Gdk.RGBA GObject property is null.
        model.border_color = this._borderColorButton.rgba;

        const flags = GObject.BindingFlags.BIDIRECTIONAL;
        model.bind_property('border-color', this._borderColorButton, 'rgba', flags);
        model.bind_property('border-width', this._borderWidthAdjustment, 'value', flags);
        model.bind_property('card-layout', this._layoutGroup, 'value', flags);
        model.bind_property('card-order', this._orderGroup, 'value', flags);
        model.bind_property('image-filter', this._filterGroup, 'value', flags);
        model.bind_property('sounds-cursor-click', this._clickSoundGroup, 'value', flags);
        model.bind_property('sounds-cursor-hover', this._hoverSoundGroup, 'value', flags);
        model.bind_property('text-transformation', this._textGroup, 'value', flags);

        this._model = model;
    }
});
