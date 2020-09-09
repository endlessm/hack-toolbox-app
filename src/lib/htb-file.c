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
#define _GNU_SOURCE  // for TEMP_FAILURE_RETRY

#include <fcntl.h>
#include <errno.h>
#include <unistd.h>

#include "htb.h"

// Adapted from glnx_throw_errno_prefix()
static gboolean
_htb_throw_errno_prefix (GError **error,
                         const char *fmt,
                         ...)
{
  if (!error)
    return FALSE;

  int errsv = errno;
  va_list args;
  va_start (args, fmt);

  g_set_error_literal (error,
                       G_IO_ERROR,
                       g_io_error_from_errno (errsv),
                       g_strerror (errsv));

  g_autofree char *old_msg = g_steal_pointer (&(*error)->message);
  g_autoptr(GString) buf = g_string_new ("");
  g_string_append_vprintf (buf, fmt, args);
  g_string_append (buf, ": ");
  g_string_append (buf, old_msg);
  (*error)->message = g_string_free (g_steal_pointer (&buf), FALSE);

  va_end (args);

  errno = errsv;
  return FALSE;
}

/**
 * hack_toolbox_open_fd_readonly:
 * @file: GFile to open
 * @error: Error
 *
 * Returns: file descriptor, or -1 on error
 */
int
hack_toolbox_open_fd_readonly (GFile *file,
                               GError **error)
{
  g_return_val_if_fail (file, -1);
  g_return_val_if_fail (G_IS_FILE (file), -1);
  g_return_val_if_fail (error == NULL || *error == NULL, -1);

  int open_flags = O_RDONLY | O_CLOEXEC | O_NOCTTY;

  g_autofree char *path = g_file_get_path (file);
  if (!path)
    {
      g_autofree char *uri = g_file_get_uri (file);
      g_set_error (error, G_IO_ERROR, G_IO_ERROR_NOT_REGULAR_FILE,
                   "File with URI %s did not have a local path", uri);
    }

  int fd = TEMP_FAILURE_RETRY (open (path, open_flags));
  if (fd == -1)
    _htb_throw_errno_prefix (error, "open(%s)", path);

  return fd;
}

/**
 * hack_toolbox_open_bytes:
 * @bytes: bytes to send to the pipe
 * @error: Return location for a #GError, or %NULL
 *
 * Creates a pipe and sends @bytes to it, such that it is suitable for passing
 * to g_subprocess_launcher_take_fd().
 *
 * Returns: file descriptor, or -1 on error
 */
int
hack_toolbox_open_bytes(GBytes *bytes,
                        GError **error)
{
  g_return_val_if_fail (bytes, -1);
  g_return_val_if_fail (error == NULL || *error == NULL, -1);

  int pipefd[2];
  if (pipe2 (pipefd, O_CLOEXEC) == -1)
    {
      _htb_throw_errno_prefix (error, "pipe2");
      return -1;
    }

  size_t count;
  const void *buf = g_bytes_get_data (bytes, &count);

  ssize_t bytes_written = TEMP_FAILURE_RETRY (write (pipefd[1], buf, count));
  if (bytes_written == -1)
    {
      _htb_throw_errno_prefix (error, "write");
      return -1;
    }

  if (bytes_written != count)
    g_warning ("%s: %zd bytes sent, only %zu bytes written", __func__, count,
               bytes_written);

  int result = TEMP_FAILURE_RETRY (close (pipefd[1]));
  if (result == -1)
    {
      _htb_throw_errno_prefix (error, "close");
      return -1;
    }

  return pipefd[0];
}
