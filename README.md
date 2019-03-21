Hack Toolbox
============

## Development

### Building a Flatpak bundle

Use the `./build-flatpak.sh` script to build a Flatpak from the latest
git commit.

### Building a local Flatpak

Use the `build-local-flatpak.sh` script for developing. The script
also takes any extra arguments for `flatpak-builder`, thus, if you
want to quickly build a Flatpak with any changes you may have done,
and install it in the user installation base, you can do:

`./tools/build-local-flatpak.sh --install`


### Testing local changes
Commit your local changes.
Use the `./build-flatpak.sh` script to build a Flatpak from the latest
git commit.
Update the local application using `flatpak update --assumeyes --no-deps com.endlessm.HackToolbox`
Run the local version using `flatpak run --env=HACK_TOOLBOX_PERSIST=1 com.endlessm.HackToolbox`

### Coding Style

The continuous integration tool runs checks to validate the PRs. To
run the checks locally before sending your PR, you will need to
install:

- [eslint](https://github.com/eslint/eslint)
- [yamllint](https://github.com/adrienverge/yamllint)

Then call:

``` shell
eslint .
yamllint .
```

### Glade Catalog

If you add a new widget, you will have to add it to the Glade catalog.

Install the Glade app (it's available in Endless OS through
flathub). Go to **Preferences**. In **Extra Catalog Paths**, click on
the plus icon, then find your checkout directory, and select the
directory `data/glade/` where the `toolbox.glade.xml` is.

Restart Glade. If the catalog was imported, you will see entries for
"Hack Toolbox" widgets in the Widgets menu of the central panel. Your
new widget should be among them.
