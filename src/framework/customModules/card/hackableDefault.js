/* exported HackableDefault */
/* global custom_modules */
// Copyright 2018 Endless Mobile, Inc.

const {Emeus, GLib, GObject, Gtk} = imports.gi;
const Gettext = imports.gettext;
GObject.type_ensure(Emeus.ConstraintLayout.$gtype);

const Card = imports.framework.interfaces.card;
const Config = imports.framework.config;
const {FormattableLabel} = imports.framework.widgets.formattableLabel;
const Module = imports.framework.interfaces.module;
const {SpaceContainer} = imports.framework.widgets.spaceContainer;
const TextFilters = custom_modules.textFilters;
const TextProcessing = custom_modules.textProcessing;
const Utils = imports.framework.utils;
const {View} = imports.framework.interfaces.view;

const ngettext = Gettext.dngettext.bind(null, Config.GETTEXT_PACKAGE);

const CardType = {
    LOW_RES_IMAGE: 0,
    MED_RES_IMAGE: 1,
    HIGH_RES_IMAGE: 2,
};

const THRESHOLDS = {
    LOW_RES_IMAGE: {
        width: 600,
        height: 400,
    },
    MED_RES_IMAGE: {
        width: 800,
        height: 600,
    },
    HIGH_RES_IMAGE: {
        width: 1200,
        height: 1000,
    },
};

const CARD_POLAROID_VERTICAL_HEIGHTS = {
    XSMALL: 80,
    SMALL: 120,
    MEDIUM: 140,
    LARGE: 220,
};

var HackableDefault = new Module.Class({
    Name: 'Card.HackableDefault',
    Extends: Gtk.Button,
    Implements: [View, Card.Card],

    Template: 'resource:///com/endlessm/HackToolbox/CustomModules/card/hackableDefault.ui',
    InternalChildren: ['layout', 'inner-content-grid', 'thumbnail-frame',
        'grid', 'title-label', 'synopsis-label', 'context-frame',
        'thumbnail-overlay', 'content-overlay', 'title-box'],
    Properties: {
        justify: GObject.ParamSpec.enum('justify',
            'Justify', 'Horizontal justification of the title, synopsis and context',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            Gtk.Justification.$gtype, Gtk.Justification.LEFT),
        textfilter: GObject.ParamSpec.string('textfilter', 'Text filter', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            'normal'),
        rotation: GObject.ParamSpec.uint('rotation', 'Rotation',
            'Number of positions to advance each letter in the string',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            0, 25, 0),
        decodefunc: GObject.ParamSpec.string('decodefunc', 'Decode Function',
            'Source code of function to evaluate to decode the text',
            GObject.ParamFlags.WRITABLE | GObject.ParamFlags.CONSTRUCT,
            ''),
    },

    _init: function (props = {}) {
        Object.defineProperties(this, {
            excluded_types: {
                value: props.excluded_types ? props.excluded_types.slice(0) : [],
                writable: false,
            },
        });
        delete props.excluded_types;
        // eslint-disable-next-line no-restricted-syntax
        this.parent(props);

        // Drop-in replacement for Card.Default, assume all its theming
        this.get_style_context().add_class('CardDefault');

        this.set_thumbnail_frame_from_model(this._thumbnail_frame);

        this.set_title_label_from_model(this._title_label);

        this.set_label_or_hide(this._synopsis_label, this.model.synopsis);

        this._context_widget = this.create_context_widget_from_model();
        this._context_frame.add(this._context_widget);
        this._setup_justification();

        this.set_size_request(Card.MinSize.B, Card.MinSize.B);

        this.show_all();

        Utils.set_hand_cursor_on_widget(this);
        this._card_type = this._get_card_type();

        if (this._card_type === CardType.HIGH_RES_IMAGE)
            this.set_media_overlay_from_model(this._content_overlay);
        else
            this.set_media_overlay_from_model(this._thumbnail_overlay);
    },

    get rotation() {
        return this._rotation;
    },

    set rotation(value) {
        this._rotation = value;
    },

    get decodefunc() {
        throw new Error('property not readable');
    },

    set decodefunc(value) {
        if (!value) {
            this._decodefunc = null;
            return;
        }
        // eslint-disable-next-line no-new-func
        this._decodefunc = new Function('letter', value);
    },

    _setup_justification: function () {
        const props = {
            halign: Gtk.Align.START,
            justify: Gtk.Justification.LEFT,
            xalign: 0,
        };
        if (this.justify === Gtk.Justification.CENTER) {
            props.halign = Gtk.Align.CENTER;
            props.justify = Gtk.Justification.CENTER;
            props.xalign = 0.5;
        } else if (this.justify === Gtk.Justification.FILL) {
            props.halign = Gtk.Align.FILL;
            props.justify = Gtk.Justification.FILL;
            props.xalign = 0;
        } else if (this.justify === Gtk.Justification.RIGHT) {
            props.halign = Gtk.Align.END;
            props.justify = Gtk.Justification.RIGHT;
            props.xalign = 1;
        }
        Object.assign(this._title_label, props);
        Object.assign(this._synopsis_label, props);
        this._context_frame.halign = props.halign;
    },

    _get_card_type: function () {
        if (!this.model.thumbnail_uri)
            return CardType.LOW_RES_IMAGE;
        const size = Utils.get_image_size_from_uri(this.model.thumbnail_uri);

        if (!size)
            return CardType.LOW_RES_IMAGE;

        let chosen_type;
        Object.entries(CardType)
        .filter(([, value]) => !this.excluded_types.includes(value))
        .find(([key, value]) => {
            // This bears a little explanation. It finds either the first
            // card type where the height and width are over the threshold, or
            // the last card type if there is none.
            chosen_type = value;
            const {width, height} = THRESHOLDS[key];
            return size.width > width && size.height > height;
        });
        return chosen_type;
    },

    // Layout for Polaroid card in horizontal orientation.
    // This orientation always shows the context.
    _get_constraints_polaroid_card_horizontal: function (show_synopsis) {
        return [
            {
                target_object: this._title_box,
                target_attribute: show_synopsis
                    ? Emeus.ConstraintAttribute.BOTTOM
                    : Emeus.ConstraintAttribute.CENTER_Y,
                source_object: show_synopsis ? this._synopsis_label : null,
                source_attribute: show_synopsis
                    ? Emeus.ConstraintAttribute.TOP
                    : Emeus.ConstraintAttribute.CENTER_Y,
            },
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.RIGHT,
                source_attribute: Emeus.ConstraintAttribute.RIGHT,
            },
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._synopsis_label,
                target_attribute: Emeus.ConstraintAttribute.TOP,
                source_attribute: Emeus.ConstraintAttribute.CENTER_Y,
            },
            {
                target_object: this._synopsis_label,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
            {
                target_object: this._synopsis_label,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.BOTTOM,
                source_attribute: Emeus.ConstraintAttribute.BOTTOM,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
        ];
    },

    // Layout for Polaroid card in vertical orientation.
    // This orientation never shows the synopsis.
    get_constraints_polaroid_card_vertical: function (show_context) {
        return [
            {
                target_object: this._title_box,
                target_attribute: show_context
                    ? Emeus.ConstraintAttribute.TOP
                    : Emeus.ConstraintAttribute.CENTER_Y,
                source_attribute: show_context
                    ? Emeus.ConstraintAttribute.TOP
                    : Emeus.ConstraintAttribute.CENTER_Y,
            },
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.BOTTOM,
                source_attribute: Emeus.ConstraintAttribute.BOTTOM,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
        ];
    },

    // Layout for Post card. This card never shows the synopsis.
    _get_constraints_post_card: function (show_context) {
        return [
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.TOP,
                source_attribute: Emeus.ConstraintAttribute.TOP,
            },
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.BOTTOM,
                source_object: show_context ? this._context_frame : null,
                source_attribute: show_context
                    ? Emeus.ConstraintAttribute.TOP
                    : Emeus.ConstraintAttribute.BOTTOM,
            },
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.BOTTOM,
                source_attribute: Emeus.ConstraintAttribute.BOTTOM,
            },
        ];
    },

    // Layout for all text card.
    _get_constraints_text_card: function (show_synopsis) {
        return [
            {
                target_object: this._title_box,
                target_attribute: show_synopsis
                    ? Emeus.ConstraintAttribute.BOTTOM
                    : Emeus.ConstraintAttribute.CENTER_Y,
                source_object: show_synopsis ? this._synopsis_label : null,
                source_attribute: show_synopsis
                    ? Emeus.ConstraintAttribute.TOP
                    : Emeus.ConstraintAttribute.CENTER_Y,
            },
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._title_box,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
            {
                target_object: this._synopsis_label,
                target_attribute: Emeus.ConstraintAttribute.TOP,
                source_attribute: Emeus.ConstraintAttribute.CENTER_Y,
            },
            {
                target_object: this._synopsis_label,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_object: this._title_box,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
            {
                target_object: this._synopsis_label,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_object: this._title_box,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.WIDTH,
                source_attribute: Emeus.ConstraintAttribute.WIDTH,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
            {
                target_object: this._context_frame,
                target_attribute: Emeus.ConstraintAttribute.BOTTOM,
                source_attribute: Emeus.ConstraintAttribute.BOTTOM,
            },
        ];
    },

    _main_layout(card_width, card_height, text_fraction, text_constant,
        text_portion_attr, text_full_attr) {
        const constraints = [
            {
                target_object: this._thumbnail_frame,
                target_attribute: Emeus.ConstraintAttribute.TOP,
                source_attribute: Emeus.ConstraintAttribute.TOP,
            },
            {
                target_object: this._thumbnail_frame,
                target_attribute: Emeus.ConstraintAttribute.LEFT,
                source_attribute: Emeus.ConstraintAttribute.LEFT,
            },
            {
                target_object: this._thumbnail_frame,
                target_attribute: text_full_attr,
                source_attribute: text_full_attr,
            },
            {
                target_object: this._grid,
                target_attribute: text_full_attr,
                source_attribute: text_full_attr,
            },
        ];

        // If it's a card with no image, align the text layout along the top
        // left of the parent card. Otherwise, align it along the right bottom.
        if (text_fraction === 1) {
            constraints.push(
                {
                    target_object: this._grid,
                    target_attribute: Emeus.ConstraintAttribute.TOP,
                    source_attribute: Emeus.ConstraintAttribute.TOP,
                },
                {
                    target_object: this._grid,
                    target_attribute: Emeus.ConstraintAttribute.LEFT,
                    source_attribute: Emeus.ConstraintAttribute.LEFT,
                }
            );
        } else {
            constraints.push(
                {
                    target_object: this._grid,
                    target_attribute: Emeus.ConstraintAttribute.RIGHT,
                    source_attribute: Emeus.ConstraintAttribute.RIGHT,
                },
                {
                    target_object: this._grid,
                    target_attribute: Emeus.ConstraintAttribute.BOTTOM,
                    source_attribute: Emeus.ConstraintAttribute.BOTTOM,
                }
            );
        }

        // If a constant is given for the text box, make this._thumbnail_frame
        // a constant size. If no constant is given, size this._thumbnail_frame
        // based on the fraction given.
        if (text_constant === null) {
            constraints.push(
                {
                    target_object: this._thumbnail_frame,
                    target_attribute: text_portion_attr,
                    source_attribute: text_portion_attr,
                    multiplier: text_fraction < 1 && text_fraction > 0 ? 1 - text_fraction : 1,
                },
                {
                    target_object: this._grid,
                    target_attribute: text_portion_attr,
                    source_attribute: text_portion_attr,
                    multiplier: text_fraction,
                }
            );
        } else {
            constraints.push(
                {
                    target_object: this._thumbnail_frame,
                    target_attribute: text_portion_attr,
                    constant: text_portion_attr === Emeus.ConstraintAttribute.WIDTH
                        ? card_width - text_constant
                        : card_height - text_constant,
                },
                {
                    target_object: this._grid,
                    target_attribute: text_portion_attr,
                    constant: text_constant,
                }
            );
        }

        constraints.forEach(props => {
            this._layout.add_constraint(new Emeus.Constraint(props));
        });
    },

    _allocate_main_layout_post_card(width, height) {
        this._title_label.lines = 2;
        this._title_label.valign = Gtk.Align.END;
        this._main_layout(width, height, 1, null,
            Emeus.ConstraintAttribute.WIDTH, Emeus.ConstraintAttribute.HEIGHT);
    },

    _allocate_main_layout_polaroid_horizontal(show_synopsis, width, height) {
        this._title_label.lines = 3;
        this._title_label.valign = show_synopsis ? Gtk.Align.END : Gtk.Align.CENTER;

        if (width > Card.MaxSize.E) {
            this._main_layout(width, height, null, 390,
                Emeus.ConstraintAttribute.WIDTH, Emeus.ConstraintAttribute.HEIGHT);
        } else {
            this._main_layout(width, height, 0.50, null,
                Emeus.ConstraintAttribute.WIDTH, Emeus.ConstraintAttribute.HEIGHT);
        }
    },

    _allocate_main_layout_polaroid_vertical(show_context, width, height) {
        if (show_context && (height <= Card.MaxSize.B && width <= Card.MaxSize.C ||
            height <= Card.MaxSize.C && width <= Card.MaxSize.B)) {
            this._title_label.lines = 1;
        } else {
            this._title_label.lines = 2;
            this._title_box.valign = Gtk.Align.CENTER;
        }

        let inner_content_grid_height;
        if (width < Card.MaxSize.C && height < Card.MaxSize.B ||
            width < Card.MaxSize.B && height < Card.MaxSize.C)
            inner_content_grid_height = CARD_POLAROID_VERTICAL_HEIGHTS.XSMALL;
        else if (width < Card.MaxSize.D && height < Card.MaxSize.C)
            inner_content_grid_height = CARD_POLAROID_VERTICAL_HEIGHTS.SMALL;
        else if (width < Card.MaxSize.D)
            inner_content_grid_height = CARD_POLAROID_VERTICAL_HEIGHTS.MEDIUM;
        else if (width < Card.MaxSize.E)
            inner_content_grid_height = CARD_POLAROID_VERTICAL_HEIGHTS.LARGE;
        this._main_layout(width, height, null, inner_content_grid_height,
            Emeus.ConstraintAttribute.HEIGHT, Emeus.ConstraintAttribute.WIDTH);
    },

    _allocate_main_layout_text_card(show_synopsis, width, height) {
        this._thumbnail_frame.hide();

        // Title lines
        this._title_label.lines = height < Card.MaxSize.B ? 2 : 3;

        // Synopsis lines
        if (height < Card.MaxSize.B)
            this._synopsis_label.lines = 2;
        else if (height < Card.MaxSize.C)
            this._synopsis_label.lines = 4;
        else
            this._synopsis_label.lines = 6;

        this._title_label.valign = show_synopsis ? Gtk.Align.END : Gtk.Align.CENTER;

        this._main_layout(width, height, 1, null,
            Emeus.ConstraintAttribute.HEIGHT, Emeus.ConstraintAttribute.WIDTH);
    },

    vfunc_size_allocate: function (alloc) {
        const card_margins = this._get_margins();
        const real_alloc_width = alloc.width - (card_margins.left + card_margins.right);
        const real_alloc_height = alloc.height - (card_margins.top + card_margins.bottom);

        this._layout.clear_constraints();
        this._inner_content_grid.clear_constraints();

        const orientation = this._get_orientation(real_alloc_width, real_alloc_height);
        let show_synopsis = this._should_show_synopsis(this._card_type,
            real_alloc_width, real_alloc_height, orientation);
        const show_context = this._should_show_context(this._card_type,
            real_alloc_width, real_alloc_height);
        let text_constraints;

        if (this._card_type === CardType.HIGH_RES_IMAGE) {
            this.get_style_context().add_class('CardPost');
            show_synopsis = false;
            this._allocate_main_layout_post_card(real_alloc_width, real_alloc_height);
            text_constraints = this._get_constraints_post_card(show_context);
        } else if (this._card_type === CardType.MED_RES_IMAGE) {
            const context = this.get_style_context();
            context.add_class('CardPolaroid');
            if (orientation === Gtk.Orientation.HORIZONTAL) {
                context.remove_class('vertical');
                context.add_class('horizontal');
                this._allocate_main_layout_polaroid_horizontal(show_synopsis,
                    real_alloc_width, real_alloc_height);
                text_constraints =
                    this._get_constraints_polaroid_card_horizontal(show_synopsis);
            } else {
                context.remove_class('horizontal');
                context.add_class('vertical');
                this._allocate_main_layout_polaroid_vertical(show_context,
                    real_alloc_width, real_alloc_height);
                text_constraints = this.get_constraints_polaroid_card_vertical(show_context);
            }
        } else if (this._card_type === CardType.LOW_RES_IMAGE) {
            this.get_style_context().add_class('CardText');
            this._allocate_main_layout_text_card(show_synopsis,
                real_alloc_width, real_alloc_height);
            text_constraints = this._get_constraints_text_card(show_synopsis);
        }

        if (show_synopsis)
            this.set_label_or_hide(this._synopsis_label, this.model.synopsis);
        else
            this._synopsis_label.hide();

        this._context_frame.visible = show_context;

        text_constraints.forEach(props => {
            this._inner_content_grid.add_constraint(new Emeus.Constraint(props));
        });

        // Only one direct child, we give it all available space regardless of
        // its request
        void this._layout.get_preferred_width();
        // eslint-disable-next-line no-restricted-syntax
        this.parent(alloc);
        this.update_card_sizing_classes(real_alloc_height, real_alloc_width);
    },

    _get_orientation: function (width, height) {
        const horizontal = width > Card.MaxSize.C && height < Card.MinSize.C ||
            width > Card.MaxSize.D && height < Card.MinSize.E ||
            width > Card.MaxSize.E;
        return horizontal ? Gtk.Orientation.HORIZONTAL : Gtk.Orientation.VERTICAL;
    },

    _should_show_synopsis: function (card_type, width, height, orientation) {
        if (card_type === CardType.LOW_RES_IMAGE) {
            return !(height < Card.MaxSize.C && width > Card.MinSize.E ||
                height < Card.MaxSize.A);
        }
        if (card_type === CardType.MED_RES_IMAGE) {
            return height > Card.MaxSize.C && width > Card.MaxSize.E &&
                orientation === Gtk.Orientation.HORIZONTAL;
        }
        return false;
    },

    _should_show_context: function (card_type, width, height) {
        if (card_type === CardType.LOW_RES_IMAGE)
            return true;
        if (card_type === CardType.MED_RES_IMAGE)
            return !(width <= Card.MaxSize.B && height <= Card.MaxSize.C);
        return !(height < Card.MinSize.C && width < Card.MinSize.C);
    },

    _get_margins: function () {
        const context = this.get_style_context();
        const flags = this.get_state_flags();

        context.save();
        context.set_state(flags);
        const card_margins = context.get_margin(context.get_state());
        context.restore();
        return card_margins;
    },

    _processText(text) {
        const caesar = TextProcessing.caesar(text, this._rotation,
            this._decodefunc);
        return TextFilters[this.textfilter](caesar);
    },

    // View override
    set_label_or_hide(label, text) {
        const processedText = this._processText(text);
        label.label = GLib.markup_escape_text(processedText, -1);
        label.visible = !!processedText;
    },

    // Card override
    _create_contextual_tag_widget() {
        const widget = new SpaceContainer({
            orientation: Gtk.Orientation.HORIZONTAL,
            halign: Gtk.Align.START,
        });

        // Sort the context tags from shortest to longest in order to
        // maximise chances that we can fit two of them on the card.
        const titles = this.get_parent_set_titles().sort((a, b) => a.length - b.length);
        if (titles.length > 0) {
            const first_tag = new FormattableLabel({
                lines: 1,
                label: this._processText(titles[0]),
            });
            widget.add(first_tag);

            if (titles.length > 1) {
                const second_tag = new FormattableLabel({
                    lines: 1,
                    label: ` | ${this._processText(titles[1])}`,
                });
                widget.add(second_tag);
            }
            widget.show_all();
        }
        return widget;
    },

    // Card override
    _create_inventory_widget() {
        this._child_count = 0;
        const label = new FormattableLabel();

        this._count_set(this.model, count => {
            const text = ngettext('%d item', '%d items', count).format(count);
            label.label = this._processText(text);
            label.show();
        });
        return label;
    },
});
