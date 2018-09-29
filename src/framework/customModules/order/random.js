/* exported Random */

const {GLib, GObject} = imports.gi;

const Module = imports.framework.interfaces.module;
const {Order} = imports.framework.interfaces.order;

var Random = new Module.Class({
    Name: 'Order.Random',
    Extends: GObject.Object,
    Implements: [Order],

    compare_impl() {
        return GLib.random_double() > 0.5 ? -1 : 1;
    },
});
