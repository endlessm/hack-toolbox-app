#pragma once

#include <glib.h>
#include <gio/gio.h>

G_BEGIN_DECLS

int
hack_toolbox_open_fd_readonly(GFile *file,
                              GError **error);

int
hack_toolbox_open_bytes(GBytes *bytes,
                        GError **error);

G_END_DECLS
