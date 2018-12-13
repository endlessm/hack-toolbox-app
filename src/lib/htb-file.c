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
