/*
 * Copyright © 2020 Endless OS Foundation LLC.
 *
 * This file is part of hack-toolbox-app
 * (see https://github.com/endlessm/hack-toolbox-app).
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
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

