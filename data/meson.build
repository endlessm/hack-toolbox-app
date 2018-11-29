# Copyright 2018 Endless Mobile, Inc.

gnome.compile_resources('com.endlessm.HackToolbox.data',
    'com.endlessm.HackToolbox.data.gresource.xml',
    gresource_bundle: true, install: true, install_dir: pkgdatadir)

install_data('com.endlessm.HackToolbox.desktop',
    install_dir: join_paths(get_option('datadir'), 'applications'))

install_data('framework/app-descriptions/Hackdex_chapter_one.yaml',
    install_dir: join_paths(pkgdatadir, 'app-descriptions'))

subst = configuration_data()
subst.set('bindir', join_paths(get_option('prefix'), get_option('bindir')))
configure_file(input: 'com.endlessm.HackToolbox.service.in',
    output: 'com.endlessm.HackToolbox.service',
    configuration: subst,
    install_dir: join_paths(get_option('datadir'), 'dbus-1', 'services'))

stylesdir = join_paths(get_option('datadir'), 'gtksourceview-3.0', 'styles')
install_data('gtksourceview-3.0/styles/hack.xml', install_dir: stylesdir)

install_subdir(
    'lockscreens',
    install_dir: 'share/lockscreens',
    strip_directory: true
)

meson.add_install_script('extra-install.sh')
