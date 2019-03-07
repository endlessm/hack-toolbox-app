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

function appInfoForAppId(id) {
    // Check GDesktopAppInfo's default search paths first, and get info for any
    // application whose information is available to the flatpak sandbox
    let appInfo = Gio.DesktopAppInfo.new(`${id}.desktop`);
    if (appInfo)
        return appInfo;

    // Check system data dirs, and also flatpak export dirs and host's data dir
    const dirs = GLib.get_system_data_dirs().concat([
        '/var/lib/flatpak/exports/share',
        '/var/endless-extra/flatpak/exports/share',
        '/run/host/usr/share',
    ]);

    const desktopFile = new GLib.KeyFile();
    for (const datadir of dirs) {
        const path = GLib.build_filenamev([datadir, 'applications', `${id}.desktop`]);
        try {
            desktopFile.load_from_file(path, GLib.KeyFileFlags.NONE);
        } catch (e) {
            if (e.matches(GLib.FileError, GLib.FileError.NOENT))
                continue;
            throw e;
        }

        // Now that we have the keyfile, set the Exec line to some well-known
        // binary, so that Gio.DesktopAppInfo doesn't trip up when we try to
        // read it, as the binary listed there won't be accessible to the
        // flatpak sandbox.
        desktopFile.set_string(GLib.KEY_FILE_DESKTOP_GROUP,
            GLib.KEY_FILE_DESKTOP_KEY_EXEC, '/bin/true');

        appInfo = Gio.DesktopAppInfo.new_from_keyfile(desktopFile);

        // Need to override the get_id function here - creating the desktop file
        // with Gio.DesktopAppInfo.new_from_keyfile does not set the underlying
        // desktop ID and there is no way to set it after construction.
        appInfo.get_id = function() {
            return `${id}.desktop`;
        };

        return appInfo;
    }

    return null;
}
