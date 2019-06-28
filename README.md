Hack Toolbox
============

## Description of architecture ##

### Hack toolbox ###

The hack toolbox is a single application, that opens and closes windows
("toolbox windows") at an appropriate time when Hack apps are flipped
over.
Its responsibility is to make sure, when the user clicks the
flip-to-hack button, that there is a toolbox window open and ready.
GNOME Shell does the actual job of matching the toolbox window to the
app window and executing the flipping animation.

The toolbox application exports an action on DBus, called `flip`.
When the user clicks the flip-to-hack button, this action is activated,
with two parameters: the application ID (e.g. `com.endlessm.Fizzics`)
and the DBus object path of the window that was flipped (e.g.
`/com/endlessm/Fizzics/window/1`).
The latter parameter is theoretically to be able to handle flipping
applications with more than one window, but that wasn't currently used.

The hack toolbox application picks out the proper toolbox widget with a
`switch` statement, creates an instance of it, and puts it in a toolbox
window.
Most toolbox widgets inherit from `Toolbox` in `toolbox.js`, which
provides all the toolbox chrome such as the "masthead" in the upper left
corner, an interface to add "topics", and the collapsing feature.

The toolbox code should communicate with the application over DBus,
either through a DBus interface provided especially for this purpose, or
through a general-purpose interface such as Clippy.

#### Delayed apply ####

A toolbox window _may_ export an action on DBus called `flip-back`.
If it does, GNOME Shell will _not_ flip back to the application window
immediately, but wait for the application window to be closed and for a
new one to appear.
This is in order to implement toolboxes that cannot adjust the app
instantly, but instead have to restart it for the changes to be applied,
such as the Framework toolbox.
In this case, it's the toolbox's responsibility to close the app and
restart it with any necessary arguments.
(Note! If the toolbox exports the `flip-back` action but no new window
appears, then GNOME Shell will never flip the toolbox window.)

## Hacking an application ##

In most toolboxes, there are two ways to hack an application; either
through changing GUI widgets in a "control panel", or assigning values
to variables, using JavaScript syntax, in a "code view".
The toolbox generally follows a model-view architecture, where the
control panel and code view are both views of the same model.
It's the model's responsibility to communicate with the application
that's being hacked.
For applications using the hack-toy-apps mechanism, this communication
happens via Clippy; see `src/clippyWrapper.js`.

Code views do some validation of the ranges and types of the values
assigned to the variables.
If the code in a code view doesn't pass validation, then the model isn't
updated and therefore neither is the control panel.

It's often possible to assign values in a code view that are outside the
ranges allowed by the control panel widgets.
This is intentional.
It's also possible to do some rudimentary programming in the code view
such as `obstacleSize = shipSize / 3;`.
A relationship such as this can't be reflected in the model or the
control panel widgets, but it will be preserved in the code view,
unless it's edited some other way.
(That is, given the above example, changing the 'obstacle size' control
panel widget will clobber the code view's relationship between
`obstacleSize` and `shipSize`.)

## Topics ##

Topics are exported as objects on DBus which can be manipulated by the
quest scripts.
You can hide or reveal a topic, make it insensitive (ignore mouse and
keyboard input), and get a notification when it is clicked on.
Topics can also have lockscreens (see below.)

## User Functions ##

User functions are code views that contain a function definition,
instead of a list of variable assignments.
They define behaviour, so they don't have a control panel counterpart.

The user functions and variables belonging to an app, together basically
form an API for what the player can hack in that app.
Note that these functions and variables aren't literally "injected" into
the app's code.
The variables are turned into DBus properties, and the user functions
are passed in as strings and executed by the app (via a mechanism
similar to "Validation" below.)
It's necessary for these to be passed via such a well-defined API so
that internal app code can be as complicated as it needs to be without
the additional requirement of being didactic, and so that refactors of
app code don't break the user's work.

## Validation ##

The code in a code view (variables or user functions) is validated,
basically by executing it with a glorified `eval()`.
Errors are indicated in the margin, just like a lot of real code
editors.

Each user function has a "player API" available to it.
This is best illustrated with an example.
In the Sidetrack toolbox's Instructions topic, the user function looks
like this:
```js
function instructions() {
    riley.jump();
    riley.forward();
    // etc.
}
```
The player API here consists of a `riley` object with some methods.
Internally, the player API is placed onto a "scope" object, and the user
code is executed inside the scope of a `with` block:

```js
with (scope) {
    function instructions() {
        riley.jump();
        riley.forward();
        // ...
    }
}
```

The `with` statement ensures that when trying to resolve the name
`riley`, the value of `scope.riley` will be used.
(This is probably one of a very few justified uses of the `with`
statement in modern JavaScript.)

With the above, we can create a function that executes the user code,
pass in a scope object with the player API, then observe any changes
that happen to the scope object after executing the user function:

```js
// Note: simplified for clarity, compared to the actual code
const userCode = new Function('scope', `
    with (scope) {
        function instructions() {
            riley.jump();
            riley.forward();
            // ...
        }
    }`);
const scope = {
    riley: {
        queue: [],
        jump() {
            this.queue.push('jump');
        },
        forward() {
            this.queue.push('forward');
        },
    },
};
userCode(scope);
if (scope.riley.queue.length !== 8)
    throw new Error('Not enough instructions');
```

## Lockscreens ##

For some areas, the player has to get past a "lockscreen" by opening it
with an inventory item, usually a "key".
The presence of the inventory item is detected via the game state
service.

A lockscreen consists of two static images and an animation.
The first static image, `no-key`, is shown when the lockscreen is locked
and the player doesn't have the inventory item to open it.
The second, `has-key`, is usually a glowy version of the first, and is
shown when the needed inventory item is present.
The animation is shown when the player clicks on the `has-key` image,
and is a green-screen transition showing the lock sliding away,
revealing the toolbox or other thing underneath.

## Glossary ##

**Code view** — A code editor widget that allows controlling parameters
of an application by setting the values of pre-filled variables.
It also allows changing the behaviour of an application by injecting a
**user function**.

**Control panel** — A graphical UI that allows to control some
parameters of an application through sliders, dropdowns, checkboxes,
text entries, and other GUI widgets.

**Lockscreen** — A "shield" that blocks access to a **toolbox**, a
**control panel** widget, or a **topic**.
Each lockscreen can be opened with a certain inventory item.

**Masthead** — The upper left corner of a toolbox that displays relevant
information such as the application being hacked.

**Toolbox** — The contents of a **toolbox window**, often including a
**masthead**, **topics**, **control panel**, and **code view**.
See `src/toolbox.js` and its app-specific subclasses.

**Toolbox app** — The single application that opens and closes toolbox
windows.
See `src/app.js`.

**Toolbox window** — The window that is paired with an application
window by GNOME Shell, when the user clicks flip-to-hack.
See `src/window.js`.

**Topic** — A grouping of related **control panel** widgets.
Topics are listed along the left-hand edge of the toolbox window.
When a topic is selected, its control panel widgets appear in the
toolbox window.

**User function** — A **code view** with a function definition that the
player can use to change the behaviour of an app.

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

## Future Work ##

### Reorganizing topics ###

The topics were added later in this codebase's lifetime, after a number
of toolboxes had already been designed.
Some toolboxes have not yet been adapted to the topics system, and are
overcrowded because everything is stuck into one topic.
These toolboxes would need a reorganization.
For some toolboxes, it is probably necessary to figure out how to group
related topics together and expand / collapse them.

### Consistent lockscreens ###

We currently have several ways of restricting access to toolboxes,
individual topics within toolboxes, and individual control panel widgets
within topics.
A lockscreen can be placed at any of these levels.
As well, a topic can be initially hidden and revealed later via a DBus
interface, or a topic can be made temporarily insensitive (not reacting
to mouse or keyboard input.)

Future work should consolidate these methods of restricting and granting
access as players progress through the curriculum.

### Refactoring user functions ###

For historical reasons, user functions are passed back to the
application without the surrounding function declaration.
See https://phabricator.endlessm.com/T26818 for a proposal to change
this, and why it should be done.

### Better error detection ###

The method of validation described above isn't good enough for a good
learning environment.
For one thing, since we use the built-in JavaScript parser by way of
`new Function` (which is `eval()` in disguise), the parser bails out at
the first error.
So if there's more than one syntax error in user code, we can only
detect the first one.
And if there's any syntax error at all in user code, we can't execute
the code on the scope object to perform any further validation.
Future work could investigate more sophisticated JavaScript parsers from
the Node.js world, such as Esprima.

Second, while it will never be possible to detect all runtime errors
while running the code, we should be able to detect more than we do now
with static type analysis.
For example,

```js
function spawnEnemy() {
    if (ticksSinceSpawn > 9.46e8)
        return 'finalboss';
}
```

Such an error wouldn't be detected unless we evaluated the user code
with all possible values of `ticksSinceSpawn`.
But with type analysis, we could detect that `'finalboss'` isn't a valid
return value according to the player API of that function.
Future work could investigate using TypeScript or Flow for user code,
without exposing those complications to the player.
