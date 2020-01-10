#pragma once

#include <glib.h>
#include <gio/gio.h>
#include <glib-object.h>

G_BEGIN_DECLS

int
hack_toolbox_open_fd_readonly(GFile *file,
                              GError **error);

int
hack_toolbox_open_bytes(GBytes *bytes,
                        GError **error);

GObject *
hack_toolbox_property_get_object(GObject *obj, gchar *property);

G_END_DECLS
