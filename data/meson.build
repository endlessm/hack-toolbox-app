# Copyright 2018 Endless Mobile, Inc.

gnome.compile_resources('com.endlessm.CodingAnimationsTweak.data',
    'com.endlessm.CodingAnimationsTweak.data.gresource.xml',
    gresource_bundle: true, install: true, install_dir: pkgdatadir)

install_data('com.endlessm.CodingAnimationsTweak.desktop',
    install_dir: join_paths(get_option('datadir'), 'applications'))

subst = configuration_data()
subst.set('bindir', join_paths(get_option('prefix'), get_option('bindir')))
configure_file(input: 'com.endlessm.CodingAnimationsTweak.service.in',
    output: 'com.endlessm.CodingAnimationsTweak.service',
    configuration: subst,
    install_dir: join_paths(get_option('datadir'), 'dbus-1', 'services'))
