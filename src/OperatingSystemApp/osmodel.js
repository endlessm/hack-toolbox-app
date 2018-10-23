/* exported OSModel */
const {Gio, GObject} = imports.gi;

var OSModel = GObject.registerClass({
}, class OSModel extends GObject.Object {
    _init(props) {
        super._init(props);
        this._settingsObjects = [];
    }

    bindSetting(settings, setting, property) {
        if (!settings._keys)
            settings._keys = settings.settings_schema.list_keys();

        if (!settings._keys.includes(setting))
            return;

        /* Keep track of all settings objects used */
        if (this._settingsObjects.indexOf(settings) < 0)
            this._settingsObjects.push(settings);

        /* Also keep track of bound settings */
        if (!settings._boundSettings)
            settings._boundSettings = [];

        settings.bind(setting, this, property, Gio.SettingsBindFlags.DEFAULT);
        settings._boundSettings.push(setting);
    }

    reset() {
        this._settingsObjects.forEach(settings => {
            if (!settings._boundSettings)
                return;
            settings._boundSettings.forEach(setting => {
                settings.reset(setting);
            });
        });
    }
});
