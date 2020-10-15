# Copyright 2018 Endless Mobile, Inc.

gnome.compile_resources('com.hack_computer.HackToolbox.data',
    'com.hack_computer.HackToolbox.data.gresource.xml',
    gresource_bundle: true, install: true, install_dir: pkgdatadir)

install_data('com.hack_computer.HackToolbox.desktop',
    install_dir: join_paths(get_option('datadir'), 'applications'))

install_data('com.hack_computer.HackToolbox.metainfo.xml',
    install_dir: join_paths(get_option('datadir'), 'metainfo'))

install_data('framework/app-descriptions/Hackdex_chapter_one.yaml',
    'framework/app-descriptions/Hackdex_chapter_two.yaml',
    install_dir: join_paths(pkgdatadir, 'app-descriptions'))

subst = configuration_data()
subst.set('bindir', join_paths(get_option('prefix'), get_option('bindir')))
configure_file(input: 'com.hack_computer.HackToolbox.service.in',
    output: 'com.hack_computer.HackToolbox.service',
    configuration: subst,
    install_dir: join_paths(get_option('datadir'), 'dbus-1', 'services'))

stylesdir = join_paths(get_option('datadir'), 'gtksourceview-3.0', 'styles')
install_data('gtksourceview-3.0/styles/hack.xml', install_dir: stylesdir)

install_subdir(
    'lockscreens',
    install_dir: join_paths(pkgdatadir, 'lockscreens'),
    strip_directory: true
)

meson.add_install_script('extra-install.sh')
