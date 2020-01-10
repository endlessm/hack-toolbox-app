#pragma once

#include <glib.h>
#include <gio/gio.h>
#include <gtk/gtk.h>

G_BEGIN_DECLS

int
hack_toolbox_open_fd_readonly(GFile *file,
                              GError **error);

int
hack_toolbox_open_bytes(GBytes *bytes,
                        GError **error);

GtkWidget *
hack_toolbox_playbin_get_widget(GObject *obj);

void
hack_toolbox_playbin_set_uri(GObject *obj,
                             char    *uri);

void
hack_toolbox_playbin_set_video_filter(GObject *obj,
                                      GObject *filter);

G_END_DECLS
