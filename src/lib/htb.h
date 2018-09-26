#pragma once

#include <glib.h>
#include <gio/gio.h>

int
hack_toolbox_open_fd_readonly(GFile *file,
                              GError **error);
