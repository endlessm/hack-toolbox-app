# Copyright 2018 Endless Mobile, Inc.

gnome.compile_resources('com.endlessm.HackToolbox.src',
    'com.endlessm.HackToolbox.src.gresource.xml',
    gresource_bundle: true, install: true, install_dir: pkgdatadir)

subst = configuration_data()
subst.set('GJS', gjs.path())
subst.set('PACKAGE_VERSION', meson.project_version())
subst.set('prefix', get_option('prefix'))
subst.set('libdir', get_option('libdir'))
subst.set('pkgdatadir', pkgdatadir)
configure_file(input: 'com.endlessm.HackToolbox.in',
    output: 'com.endlessm.HackToolbox',
    configuration: subst, install_dir: get_option('bindir'))

gdbus_targets = gnome.gdbus_codegen('hack-toolbox-objects',
    '../data/com.endlessm.HackToolbox.xml',
    interface_prefix: 'com.endlessm.HackToolbox',
    namespace: 'HackToolbox')

installed_headers = [
    'lib/htb.h',
]
private_headers = [
]
sources = [
    gdbus_targets[0],
    gdbus_targets[1],
    'lib/htb-file.c',
]

include = include_directories('.')

api_version = '0'
api_name = '@0@-@1@'.format(meson.project_name(), api_version)
libtool_version = '0.0.0'
namespace_name = 'HackToolbox'
main_library = shared_library('@0@-@1@'.format(meson.project_name(), api_version),
    sources, installed_headers, private_headers,
    c_args: ['-DG_LOG_DOMAIN="@0@"'.format(namespace_name),
             '-DCOMPILING_HACKTOOLBOX'],
    dependencies: [gio, gio_unix, glib, gobject],
    include_directories: include, install: true,
    soversion: api_version, version: libtool_version)

introspection_sources = [
    sources,
    join_paths(meson.build_root(), 'src', 'hack-toolbox-objects.h'),
    installed_headers
]

gnome.generate_gir(main_library, extra_args: ['--warn-all', '--warn-error'],
    identifier_prefix: 'HackToolbox', include_directories: include,
    includes: ['Gio-2.0', 'GLib-2.0', 'GObject-2.0'],
    install: true, namespace: namespace_name, nsversion: api_version,
    sources: introspection_sources, symbol_prefix: 'hack_toolbox')

install_headers(installed_headers, subdir: api_name)

subdir('framework/customModules')
