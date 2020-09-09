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
