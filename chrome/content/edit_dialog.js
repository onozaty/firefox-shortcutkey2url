var gshortcutkey2urlBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var mystrings = gshortcutkey2urlBundle.createBundle("chrome://shortcutkey2url/locale/dialogs.properties");
var s2u_pleaseinputkeyn = mystrings.GetStringFromName("s2u_pleaseinputkeyn");
var s2u_cannotaddduplicate = mystrings.GetStringFromName("s2u_cannotaddduplicate");
var s2u_pleaseinputurl = mystrings.GetStringFromName("s2u_pleaseinputurl");
var gTreeView = null;
var gShortcutKey2URL = null;
var receiveCharNumber = null;

var init = function() {
  gShortcutKey2URL = window.arguments[0];
  gTreeView = window.arguments[1];
  receiveCharNumber = window.arguments[2];

  var seletedIndex = gTreeView.selectedIndexes[0];

  document.getElementById('key').value = gTreeView.getCellText(seletedIndex, {index: 0});
  document.getElementById('name').value = gTreeView.getCellText(seletedIndex, {index: 1});
  document.getElementById('url').value = gTreeView.getCellText(seletedIndex, {index: 2});
  document.getElementById('openMethod').value = gTreeView.getCellText(seletedIndex, {index: 3});

  document.getElementById('key').maxLength = receiveCharNumber;
}

var inputKey = function(event) {

  if (event.keyCode != event.DOM_VK_TAB && event.keyCode != event.DOM_VK_RETURN) {
    event.preventDefault();
    event.stopPropagation();
  }

  var value = event.target.value;
  switch (event.keyCode) {
    case event.DOM_VK_BACK_SPACE:
      if (value != '') {
        event.target.value = value.substr(0, value.length - 1);
      }
      break;
    case event.DOM_VK_DELETE:
      event.target.value = '';
      break;
    default:
     if (event.charCode) {
       key = String.fromCharCode(event.charCode).toUpperCase();

       if (receiveCharNumber == 1) {
         event.target.value = key;
       } else {
         if (value.length < receiveCharNumber) { 
           event.target.value = event.target.value + key;
         }
       }
     }
     break;
  }
}

var update = function() {

  var key = document.getElementById('key').value;
  var name = document.getElementById('name').value;
  var url = document.getElementById('url').value;
  var openMethod = document.getElementById('openMethod').value;

  var message = '';
  if (key == '') {
    message += s2u_pleaseinputkeyn;
  } else {
    if (gTreeView.findDuplicateData(key, receiveCharNumber, gTreeView._data[gTreeView.selectedIndexes[0]])) {
      message += s2u_cannotaddduplicate;
    }
  }
  if (url == '') {
    message += s2u_pleaseinputurl;
  }

  if (message) {
    alert(message);
    return false;
  }

  gTreeView.updateItem(key, name, url, openMethod);
}

