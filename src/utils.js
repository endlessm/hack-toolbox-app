/* exported appInfoForAppId */

const {Gio, GLib} = imports.gi;

// Taken from GJS 1.54

function _promisify(proto, asyncFunc, finishFunc) {
    proto[`_original_${asyncFunc}`] = proto[asyncFunc];
    proto[asyncFunc] = function(...args) {
        if (!args.every(arg => typeof arg !== 'function'))
            return this[`_original_${asyncFunc}`](...args);
        return new Promise((resolve, reject) => {
            const callStack = new Error().stack.split('\n')
                .filter(line => !line.match(/promisify/))
                .join('\n');
            this[`_original_${asyncFunc}`](...args, function(source, res) {
                try {
                    const result = source[finishFunc](res);
                    if (Array.isArray(result) && result.length > 1 && result[0] === true)
                        result.shift();
                    resolve(result);
                } catch (error) {
                    if (error.stack)
                        error.stack += `### Promise created here: ###\n${callStack}`;
                    else
                        error.stack = callStack;
                    reject(error);
                }
            });
        });
    };
}
Gio._promisify = _promisify;
Gio._LocalFilePrototype = Gio.File.new_for_path('').constructor.prototype;
const ResourceFilePrototype = Gio.File.new_for_uri('resource:///').constructor.prototype;

Gio._promisify(Gio._LocalFilePrototype, 'replace_contents_bytes_async',
    'replace_contents_finish');
Gio._promisify(ResourceFilePrototype, 'copy_async', 'copy_finish');
Gio._promisify(Gio.OutputStream.prototype, 'splice_async', 'splice_finish');
Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async',
    'communicate_utf8_finish');
Gio._promisify(Gio.Subprocess.prototype, 'wait_check_async',
    'wait_check_finish');

function _appInfoFromKeyFile(keyfile) {
    const startGroup = keyfile.get_start_group();
    if (!startGroup || startGroup !== GLib.KEY_FILE_DESKTOP_GROUP)
        throw new Error('Invalid .desktop file');

    const type = keyfile.get_string(GLib.KEY_FILE_DESKTOP_GROUP,
        GLib.KEY_FILE_DESKTOP_KEY_TYPE);
    if (type !== GLib.KEY_FILE_DESKTOP_TYPE_APPLICATION)
        throw new Error('Not an application .desktop file');

    const name = keyfile.get_locale_string(GLib.KEY_FILE_DESKTOP_GROUP,
        GLib.KEY_FILE_DESKTOP_KEY_NAME, null);

    let icon = null;
    try {
        let iconName = keyfile.get_locale_string(GLib.KEY_FILE_DESKTOP_GROUP,
            GLib.KEY_FILE_DESKTOP_KEY_ICON, null);
        if (GLib.path_is_absolute(iconName)) {
            const file = Gio.File.new_for_path(iconName);
            icon = new Gio.FileIcon({file});
        } else {
            // Work around a common mistake in desktop files
            if (iconName.endsWith('.png') || iconName.endsWith('.xpm') ||
                iconName.endsWith('.xvg'))
                iconName = iconName.slice(0, -4);
            icon = new Gio.ThemedIcon({name: iconName});
        }
    } catch (e) {
        void e;
    }

    return {name, icon};
}


function appInfoForAppId(id) {
    // Check GDesktopAppInfo's default search paths first
    const appInfo = Gio.DesktopAppInfo.new(`${id}.desktop`);
    if (appInfo) {
        return {
            name: appInfo.get_name(),
            icon: appInfo.get_icon(),
        };
    }

    // Try to load manually from the .desktop key file
    const desktopFile = new GLib.KeyFile();

    // Check flatpak exports
    try {
        desktopFile.load_from_file(`/var/lib/flatpak/exports/share/applications/${id}.desktop`,
            GLib.KeyFileFlags.NONE);
        return _appInfoFromKeyFile(desktopFile);
    } catch (e) {
        if (!e.matches(GLib.FileError, GLib.FileError.NOENT))
            throw e;
    }

    // Check host's applications dir
    try {
        desktopFile.load_from_file(`/run/host/usr/share/applications/${id}.desktop`,
            GLib.KeyFileFlags.NONE);
        return _appInfoFromKeyFile(desktopFile);
    } catch (e) {
        if (!e.matches(GLib.FileError, GLib.FileError.NOENT))
            throw e;
    }

    return null;
}
