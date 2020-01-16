#include "htb.h"

/**
 * hack_toolbox_property_get_object:
 * @obj: The parent object
 *
 * Gets an object property from an object. This is a workaround to get
 * the playbin widget in javascript because the direct access in gjs is not
 * working since org.gnome.Platform//2.28
 *
 * Returns: (transfer full): a #GObject
 */
GObject *
hack_toolbox_property_get_object(GObject *obj, gchar *property)
{
  GObject *retval = NULL;
  g_object_get (obj, property, &retval, NULL);
  return retval;
}

