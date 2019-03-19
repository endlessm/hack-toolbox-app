/* exported getDefault */

const {Gio} = imports.gi;

const ClubhouseIface = `
<node>
  <interface name="com.endlessm.Clubhouse">
    <method name="show">
      <arg type="u" direction="in" name="timestamp"/>
    </method>
    <method name="hide">
      <arg type="u" direction="in" name="timestamp"/>
    </method>
    <method name="getAnimationMetadata">
      <arg type="s" direction="in" name="path"/>
      <arg type="v" direction="out" name="metadata"/>
    </method>
    <property name="Visible" type="b" access="read"/>
    <property name="RunningQuest" type="s" access="read"/>
    <property name="SuggestingOpen" type="b" access="read"/>
  </interface>
</node>`;

var getDefault = (function() {
    const ClubhouseProxy = Gio.DBusProxy.makeProxyWrapper(ClubhouseIface);
    let defaultClubhouse;

    return function() {
        if (!defaultClubhouse) {
            defaultClubhouse = new ClubhouseProxy(Gio.DBus.session,
                'com.endlessm.Clubhouse', '/com/endlessm/Clubhouse');
        }
        return defaultClubhouse;
    };
}());
