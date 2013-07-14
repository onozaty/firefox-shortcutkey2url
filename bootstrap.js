const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

var WindowWatcher     = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);
var WindowMediator    = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
var PromptService     = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
var PrefService       = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
var BundleService     = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
var IOService         = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var StyleSheetService = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);

var bundleString = BundleService.createBundle("chrome://shortcutkey2url/locale/browser.properties");

Cu.import("resource://gre/modules/Services.jsm");

var windowObserver = {
  observe: function (aSubject, aTopic, aData) {

    var win = aSubject.QueryInterface(Components.interfaces.nsIDOMWindow);

    if (aTopic === "domwindowopened") {

      win.addEventListener("DOMContentLoaded", function() {
        win.removeEventListener("DOMContentLoaded", arguments.callee, false);

        if (win.location.href == "chrome://browser/content/browser.xul") {
          initializeWindow(win);
        }
      }, false);
    }
  }
};

function initializeWindow(aWindow) {

  initializeUrlbar(aWindow);
  initializeMenu(aWindow);
  initializeContextMenu(aWindow);
  initializeMainWindow(aWindow);
  initializeScript(aWindow);
}

function finalizeWindow(aWindow) {

  removeElement(aWindow, URLBAR_ICON_ELEMENT_ID);
  removeElement(aWindow, DUMMY_BUTTON_ELEMENT_ID);
  removeElement(aWindow, MENU_ITEM_ELEMENT_ID);
  removeElement(aWindow, CONTEXT_MENU_PAGE_ELEMENT_ID);
  removeElement(aWindow, CONTEXT_MENU_LINK_ELEMENT_ID);
  removeElement(aWindow, KEY_LIST_PANEL_ELEMENT_ID);
  removeElement(aWindow, DUMMY_FRAME_ELEMENT_ID);

  aWindow.gShortcutKey2URL.shutdown();
  aWindow.gShortcutKey2URL = null;
}

function removeElement(aWindow, id) {

  var element = aWindow.document.getElementById(id);
  if (element != null) { 
    element.parentNode.removeChild(element);
  }
}


// urlbar
const URLBAR_ICON_ELEMENT_ID = "shortcutKey2URL-addressbarIcon";
const DUMMY_BUTTON_ELEMENT_ID = "shortcutKey2URL-dummyButton";

function initializeUrlbar(aWindow) {

  var urlbarIcons = aWindow.document.getElementById("urlbar-icons");

  var icon = aWindow.document.createElement("image");

  icon.setAttribute("id", URLBAR_ICON_ELEMENT_ID);
  icon.setAttribute("tooltiptext", bundleString.GetStringFromName("s2u.addressbar.tooltiptext"));
  icon.setAttribute("src", "chrome://shortcutkey2url/skin/icon-small-inactive.png");

  icon.addEventListener("click", function() {
    aWindow.gShortcutKey2URL.createShortcutKeyThisPage();
  }, false);

  urlbarIcons.appendChild(icon);

  var dummyButton = aWindow.document.createElement("button");
  dummyButton.setAttribute("id", DUMMY_BUTTON_ELEMENT_ID);
  dummyButton.setAttribute("style", "display:none;");

  urlbarIcons.appendChild(dummyButton);
}

// menu
const MENU_ITEM_ELEMENT_ID = "shortcutKey2URL-settingMenu";

function initializeMenu(aWindow) {

  var menu = aWindow.document.getElementById("menu_ToolsPopup");

  var menuitem = aWindow.document.createElement("menuitem");

  menuitem.setAttribute("id", MENU_ITEM_ELEMENT_ID);
  menuitem.setAttribute("label", bundleString.GetStringFromName("s2u.menuitem.label"));
  menuitem.setAttribute("insertbefore", "sanitizeSeparator");

  menuitem.addEventListener("command", function() {
    aWindow.gShortcutKey2URL.openSetting();
  }, false);

  menu.appendChild(menuitem);
}

// context menu
const CONTEXT_MENU_PAGE_ELEMENT_ID = "shortcutKey2URL-contextMenu-page";
const CONTEXT_MENU_LINK_ELEMENT_ID = "shortcutKey2URL-contextMenu-link";

function initializeContextMenu(aWindow) {

  var menu = aWindow.document.getElementById("contentAreaContextMenu");

  var pageMenuitem = aWindow.document.createElement("menuitem");

  pageMenuitem.setAttribute("id", CONTEXT_MENU_PAGE_ELEMENT_ID);
  pageMenuitem.setAttribute("label", bundleString.GetStringFromName("s2u.contextmenu.page.label"));

  pageMenuitem.addEventListener("command", function() {
    aWindow.gShortcutKey2URL.createShortcutKeyThisPage();
  }, false);

  menu.appendChild(pageMenuitem);

  var linkMenuitem = aWindow.document.createElement("menuitem");

  linkMenuitem.setAttribute("id", CONTEXT_MENU_LINK_ELEMENT_ID);
  linkMenuitem.setAttribute("label", bundleString.GetStringFromName("s2u.contextmenu.link.label"));

  linkMenuitem.addEventListener("command", function() {
    aWindow.gShortcutKey2URL.createShortcutKeyThisLink();
  }, false);

  menu.appendChild(linkMenuitem);
}

// main window
const KEY_LIST_PANEL_ELEMENT_ID = "shortcutKey2URL-keyListPanel";
const DUMMY_FRAME_ELEMENT_ID = "shortcutKey2URL-dummyFrame";

function initializeMainWindow(aWindow) {

  var mainWindow = aWindow.document.getElementById("main-window");

  var menupopup = aWindow.document.createElement("menupopup");
  menupopup.setAttribute("id", KEY_LIST_PANEL_ELEMENT_ID);
  menupopup.setAttribute("ignorekeys", true);
  menupopup.setAttribute("noautofocus", true);
  menupopup.setAttribute("noautohide", true);

  menupopup.addEventListener("popuphiding", function() {
    aWindow.gShortcutKey2URL.endKeyReceive()();
  }, false);

  mainWindow.appendChild(menupopup);

  var iframe = aWindow.document.createElement("iframe");
  iframe.setAttribute("id", DUMMY_FRAME_ELEMENT_ID);
  iframe.setAttribute("src", "chrome://shortcutkey2url/content/dummy.xul");
  iframe.setAttribute("style", "width:0px");
  iframe.setAttribute("collapsed", "true");

  mainWindow.appendChild(iframe);
}

// script
function initializeScript(aWindow) {

  Services.scriptloader.loadSubScript("chrome://shortcutkey2url/content/shortcutkey2url.js", aWindow, "UTF-8");
  aWindow.gShortcutKey2URL.init();
}


function startup(aData, aReason) {

  var cssUrl = IOService.newURI("chrome://shortcutkey2url/skin/overlay.css", null, null);
  StyleSheetService.loadAndRegisterSheet(cssUrl, StyleSheetService.USER_SHEET);

  var browserWindows = WindowMediator.getEnumerator("navigator:browser");
  while (browserWindows.hasMoreElements()) {
    let win = browserWindows.getNext().QueryInterface(Ci.nsIDOMWindow);
    initializeWindow(win);
  }

  WindowWatcher.registerNotification(windowObserver);
}

function shutdown(aData, aReason) {

  var cssUrl = IOService.newURI("chrome://shortcutkey2url/skin/overlay.css", null, null);
  StyleSheetService.unregisterSheet(cssUrl, StyleSheetService.USER_SHEET);

  var browserWindows = WindowMediator.getEnumerator("navigator:browser");
  while (browserWindows.hasMoreElements()) {
    let win = browserWindows.getNext().QueryInterface(Ci.nsIDOMWindow);
    finalizeWindow(win);
  }

  WindowWatcher.unregisterNotification(windowObserver);
  windowObserver = null;
  WindowWatcher = null;

  //PromptService.alert(null, "debug", "shutdown finished");
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}
