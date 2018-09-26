/* exported RaControlPanel */

const {GObject, Gtk} = imports.gi;
const {ButtonGroup} = imports.framework.buttonGroup;
const {LogoImage} = imports.framework.logoImage;

var RaControlPanel = GObject.registerClass({
    GTypeName: 'RaControlPanel',
    Template: 'resource:///com/endlessm/HackToolbox/framework/controlpanel.ui',
    InternalChildren: ['accentColorButton', 'borderColorButton',
        'borderWidthAdjustment', 'clickSoundDrumKit', 'clickSoundNone',
        'clickSoundPiano', 'clickSound3', 'clickSound4', 'filterBlueprint',
        'filterCorduroy', 'filterDisco', 'filterLensFlare', 'filterNone',
        'fontButton', 'fontSizeAdjustment', 'hoverSoundNone', 'hoverSoundScifi',
        'hoverSound2', 'hoverSound3', 'hoverSound4', 'infoColorButton',
        'layoutNest', 'layoutOverflow', 'layoutPiano', 'layoutTiledGrid',
        'layoutWindshield', 'logoButton', 'logoChoices', 'logoColorButton',
        'logoMenu', 'mainColorButton', 'orderAZ', 'orderOrdered', 'orderRandom',
        'orderZA', 'textBubbles', 'textFlipped', 'textNormal', 'textScrambled',
        'textZalgo'],
}, class RaControlPanel extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        const ICONS = ['animals', 'art', 'astronomy', 'biology', 'celebrities',
            'dinosaur', 'encyclopedia', 'farming', 'geography', 'history',
            'math', 'nature', 'physics', 'soccer', 'socialsciences', 'travel'];
        ICONS.forEach(name => {
            const resource = `/com/endlessm/HackToolbox/framework/${name}.svg`;
            const widget = new LogoImage({resource, visible: true});
            this._logoChoices.add(widget);
        });
        this._logoImage = new LogoImage({
            resource: '/com/endlessm/HackToolbox/framework/dinosaur.svg',
            visible: true,
        });
        this._logoButton.add(this._logoImage);

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

        this._logoChoices.connect('child-activated',
            this._onLogoChoicesActivated.bind(this));

        // FIXME: Add more sound packs, then rename and unhide these
        [this._hoverSound2, this._hoverSound3, this._hoverSound4,
            this._clickSound3, this._clickSound4]
            .forEach(widget => widget.hide());
    }

    bindModel(model) {
        // Sync some properties from the target to the source, to begin with.
        // The default value of a Gdk.RGBA GObject property is null.
        model.accent_color = this._accentColorButton.rgba;
        model.info_color = this._infoColorButton.rgba;
        model.border_color = this._borderColorButton.rgba;
        model.logo_color = this._logoColorButton.rgba;
        model.main_color = this._mainColorButton.rgba;
        model.font = this._fontButton.font_desc;

        const flags = GObject.BindingFlags.BIDIRECTIONAL;
        model.bind_property('accent-color', this._accentColorButton, 'rgba', flags);
        model.bind_property('border-color', this._borderColorButton, 'rgba', flags);
        model.bind_property('card-borders', this._borderWidthAdjustment, 'value', flags);
        model.bind_property('click-sound', this._clickSoundGroup, 'value', flags);
        model.bind_property('filter', this._filterGroup, 'value', flags);
        model.bind_property('font', this._fontButton, 'font-desc', flags);
        model.bind_property('font-size', this._fontSizeAdjustment, 'value', flags);
        model.bind_property('hover-sound', this._hoverSoundGroup, 'value', flags);
        model.bind_property('info-color', this._infoColorButton, 'rgba', flags);
        model.bind_property('layout', this._layoutGroup, 'value', flags);
        model.bind_property('logo-color', this._logoColorButton, 'rgba', flags);
        model.bind_property('logo-graphic', this._logoImage, 'resource', flags);
        model.bind_property('main-color', this._mainColorButton, 'rgba', flags);
        model.bind_property('order', this._orderGroup, 'value', flags);
        model.bind_property('text', this._textGroup, 'value', flags);

        this._model = model;
    }

    _onLogoChoicesActivated(widget, child) {
        const choice = child.get_child();  // child of the FlowBoxChild
        this._logoImage.resource = choice.resource;
        this._logoMenu.popdown();
    }
});
