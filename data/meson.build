# Copyright 2018 Endless Mobile, Inc.

gnome.compile_resources('com.endlessm.HackToolbox.data',
    'com.endlessm.HackToolbox.data.gresource.xml',
    gresource_bundle: true, install: true, install_dir: pkgdatadir)

install_data('com.endlessm.HackToolbox.desktop',
    install_dir: join_paths(get_option('datadir'), 'applications'))

subst = configuration_data()
subst.set('bindir', join_paths(get_option('prefix'), get_option('bindir')))
configure_file(input: 'com.endlessm.HackToolbox.service.in',
    output: 'com.endlessm.HackToolbox.service',
    configuration: subst,
    install_dir: join_paths(get_option('datadir'), 'dbus-1', 'services'))

# Compile one GResource file for each soundpack
gnome.compile_resources('soundpack-drumkit',
    'framework/soundpacks/drumkit/gresource.xml', gresource_bundle: true,
    source_dir: 'framework/soundpacks/drumkit', install: true,
    install_dir: pkgdatadir)
gnome.compile_resources('soundpack-piano',
    'framework/soundpacks/piano/gresource.xml', gresource_bundle: true,
    source_dir: 'framework/soundpacks/piano', install: true,
    install_dir: pkgdatadir)
gnome.compile_resources('soundpack-scifi',
    'framework/soundpacks/scifi/gresource.xml', gresource_bundle: true,
    source_dir: 'framework/soundpacks/scifi', install: true,
    install_dir: pkgdatadir)
