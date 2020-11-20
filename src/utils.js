/*
 * Copyright © 2020 Endless OS Foundation LLC.
 *
 * This file is part of hack-toolbox-app
 * (see https://github.com/endlessm/hack-toolbox-app).
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
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
        `${GLib.get_home_dir()}/.local/share/flatpak/exports/share`,
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
        // Need to override the get_icon function here - creating the desktop
        // file with Gio.DesktopAppInfo.new_from_keyfile does not set the
        // underlying desktop icon and there is no way to set it after
        // construction.
        appInfo.get_icon = function() {
            const iconsDir = 'icons/hicolor/128x128/apps';
            const iconName = desktopFile.get_string('Desktop Entry', 'Icon') || id;
            const iconPath = GLib.build_filenamev([datadir, iconsDir, `${iconName}.png`]);
            return Gio.FileIcon.new(Gio.File.new_for_path(iconPath));
        };

        return appInfo;
    }

    return null;
}
