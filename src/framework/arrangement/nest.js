/* exported Nest */

const {Constrained} = imports.framework.modules.arrangement.constrained;
const Module = imports.framework.interfaces.module;

const _CARD_MIN_WIDTH = 100;
const _CARD_MIN_HEIGHT = 100;

var Nest = new Module.Class({
    Name: 'Arrangement.Nest',
    Extends: Constrained,

    // Arrangement override
    get_max_cards() {
        return 6;
    },

    // Arrangement.Constrained override
    get_description() {
        return [
            'H:|-[view0]-[view1]-|',
            'H:|-[view2(view4)]-[view4]-[view5(view4)]-[view1(view4)]-|',
            'H:|-[view2]-[view3]-|',
            'V:|-[view0]-[view2]-|',
            'V:|-[view0(view4)]-[view4]-[view3(view4)]-|',
            'V:|-[view0]-[view5(view4)]-[view3]-|',
            'V:|-[view1]-[view3]-|',
        ];
    },

    vfunc_get_preferred_width() {
        return [_CARD_MIN_WIDTH * 4, _CARD_MIN_WIDTH * 4];
    },

    vfunc_get_preferred_height() {
        return [_CARD_MIN_HEIGHT * 3, _CARD_MIN_HEIGHT * 3];
    },
});
