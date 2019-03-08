Hack Toolbox
============

## Development

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
