#include "htb.h"

/**
 * hack_toolbox_playbin_get_widget:
 * @obj: The parent object
 *
 * Get the widget property of a gstbin object. This is a workaround to get
 * the playbin widget in javascript because the direct access in gjs is not
 * working since org.gnome.Platform//2.28
 *
 * Returns: (transfer full): a #GtkWidget
 */
GtkWidget *
hack_toolbox_playbin_get_widget(GObject *obj)
{
  GtkWidget *widget = NULL;
  GObject * sink = NULL;
  g_object_get (obj, "video_sink", &sink, NULL);
  g_object_get (sink, "widget", &widget, NULL);
  return widget;
}

/**
 * hack_toolbox_playbin_set_uri:
 * @obj: The gstbin
 *
 * Set the uri property of a gstbin object. This is a workaround to set
 * the playbin uri in javascript because the direct access in gjs is not
 * working since org.gnome.Platform//2.28
 */
void
hack_toolbox_playbin_set_uri(GObject *obj,
                             char    *uri)
{
  g_object_set (obj, "uri", uri, NULL);
}

/**
 * hack_toolbox_playbin_set_video_filter:
 * @obj: The gstbin
 *
 * Set the uri property of a gstbin object. This is a workaround to set
 * the playbin uri in javascript because the direct access in gjs is not
 * working since org.gnome.Platform//2.28
 */
void
hack_toolbox_playbin_set_video_filter(GObject *obj,
                                      GObject *filter)
{
  g_object_set (obj, "video-filter", filter, NULL);
}
