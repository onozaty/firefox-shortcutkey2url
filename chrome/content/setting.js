var gshortcutkey2urlBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var mystrings = gshortcutkey2urlBundle.createBundle("chrome://shortcutkey2url/locale/settings.properties");
var s2u_pleaseselectrecord = mystrings.GetStringFromName("s2u_pleaseselectrecord");
var s2u_areyousure = mystrings.GetStringFromName("s2u_areyousure");
var s2u_mayiclose = mystrings.GetStringFromName("s2u_mayiclose");
var s2u_fromatillegal = mystrings.GetStringFromName("s2u_fromatillegal");
var s2u_exportfile = mystrings.GetStringFromName("s2u_exportfile");
var s2u_importfile = mystrings.GetStringFromName("s2u_importfile");
var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
                   .getService(Components.interfaces.nsIWindowMediator);
var mainWindow = wm.getMostRecentWindow('navigator:browser');

var gShortcutKey2URL = mainWindow.gShortcutKey2URL;
var gTreeView = null;

var startupKey = null;
var receiveCharNumber = null;

/////////////////////////////////////////////////////////////////

var init = function() {
  initView(gShortcutKey2URL);

  if (window.arguments && window.arguments[0]) {
    // add url
    gTreeView.appendItem(window.arguments[0].key, window.arguments[0].name, window.arguments[0].url, window.arguments[0].openMethod);
  }
}

var initView = function(settings) {

  gTreeView = new TreeView(cloneArray(settings.settingData));
  document.getElementById('treeView').view = gTreeView;

  dispStartupKey(settings.startupKey.modifiers, settings.startupKey.key);
  startupKey = settings.startupKey;

  document.getElementById('numberOfCharacters').value = settings.receiveCharNumber;
  receiveCharNumber = settings.receiveCharNumber;

  document.getElementById('showIcon').checked = settings.isShowIconInAddressBar;

  document.getElementById('showList').checked = settings.isShowListOfShortcutKey;

  gTreeView._setHeader(document.getElementById('keyColumn'), 'ascending');
}

var cloneArray = function(src) {
  var dest = [];
  for (var i = 0, len = src.length; i < len; i++) {
    dest.push(cloneObject(src[i]));
  }
  return dest;
}

var cloneObject = function(src) {
  var dest = {};
  for (var property in src) {
    dest[property] = src[property];
  }
  return dest;
}

/////////////////////////////////////////////////////////////////

var inputStartupKey = function(event) {

  if (event.keyCode != event.DOM_VK_TAB
      && event.keyCode != event.DOM_VK_ESCAPE
      && event.keyCode != event.DOM_VK_RETURN
      && event.keyCode != event.DOM_VK_ENTER) {
    event.preventDefault();
    event.stopPropagation();
  }

  var modifiers = gShortcutKey2URL.getModifiers(event);
  var key = gShortcutKey2URL.getKeyString(event);

  if (!modifiers || !key) return;

  dispStartupKey(modifiers, key);
  startupKey = {modifiers: modifiers, key: key};

}

var inputNumberOfCharacters = function(event) {

  if (event.keyCode != event.DOM_VK_TAB
      && event.keyCode != event.DOM_VK_ESCAPE
      && event.keyCode != event.DOM_VK_RETURN
      && event.keyCode != event.DOM_VK_ENTER) {
    event.preventDefault();
    event.stopPropagation();
  }

  var key = gShortcutKey2URL.getKeyString(event);

  if (!/^[1-5]$/.test(key)) return;

  event.target.value = key;
  receiveCharNumber = key;
}

var dispStartupKey = function(modifiers, key) {
  document.getElementById('startupKey').value = formatStartupKey(modifiers, key);
  var otherKey = gShortcutKey2URL.getBrowserShotcutKey(modifiers, key);
  if (otherKey) {
    document.getElementById('startupKeyDuplicate').removeAttribute('style');
  } else {
    document.getElementById('startupKeyDuplicate').setAttribute('style', 'display: none;');
  }
}

var formatStartupKey = function(modifiers, key) {

  if (!(modifiers instanceof Array)) {
    modifiers = modifiers.split(' ');
  } else {
    modifiers = modifiers.concat();
  }

  for (var i = 0, len = modifiers.length; i < len; i++) {
    if (modifiers[i] == 'control') modifiers[i] = 'ctrl';
    modifiers[i] = modifiers[i].charAt(0).toUpperCase() + modifiers[i].substring(1);
  }

  return modifiers.join('+') + '+' + key;
}

/////////////////////////////////////////////////////////////////

var selectTree = function() {
  document.getElementById('editButton').removeAttribute('disabled');
  document.getElementById('deleteButton').removeAttribute('disabled');
}

var add = function() {
  window.openDialog('chrome://shortcutkey2url/content/add_dialog.xul', 'shortcutKey2URL-addDialog', 'centerscreen, chrome', gShortcutKey2URL, gTreeView, receiveCharNumber);
}

var edit = function() {
  if (gTreeView.selectedIndexes.length == 0) {
    alert(s2u_pleaseselectrecord);
    return;
  }
  window.openDialog('chrome://shortcutkey2url/content/edit_dialog.xul', 'shortcutKey2URL-editDialog', 'centerscreen, chrome', gShortcutKey2URL, gTreeView, receiveCharNumber);
}

var del = function() {
  if (gTreeView.selectedIndexes.length == 0) {
    alert(s2u_pleaseselectrecord);
    return;
  }
/*
  if (confirm(s2u_areyousure)) {
    gTreeView.deleteItems();
  }
*/
  gTreeView.deleteItems();

}

var keypressMappingList = function(event) {

  if (gTreeView.selectedIndexes.length == 0) {
    return;
  }

  switch(event.keyCode) {
    case event.DOM_VK_RETURN:
    case event.DOM_VK_ENTER:
      edit();
      event.preventDefault();
      event.stopPropagation();
      break;
    case event.DOM_VK_DELETE:
      del();
      event.preventDefault();
      event.stopPropagation();
      break;
    default:
      break;
  }
}

/////////////////////////////////////////////////////////////////

var update = function() {
  saveSettings();
  closeDialogs();
}

var saveSettings = function() {
  gShortcutKey2URL.settingData = gTreeView._data;
  gShortcutKey2URL.startupKey = startupKey;
  gShortcutKey2URL.receiveCharNumber = receiveCharNumber;
  gShortcutKey2URL.isShowIconInAddressBar = document.getElementById('showIcon').checked;
  gShortcutKey2URL.isShowListOfShortcutKey = document.getElementById('showList').checked;

  gShortcutKey2URL.changeAddressbarIconDisplay();
  gShortcutKey2URL.saveSetting();
}

var isChangeSettings = function() {
  return (gShortcutKey2URL.settingData.toSource()
          != gShortcutKey2URL.sortSettingData(gTreeView._data.concat()).toSource()
         || gShortcutKey2URL.startupKey.toSource() != startupKey.toSource()
         || gShortcutKey2URL.receiveCharNumber != receiveCharNumber
         || gShortcutKey2URL.isShowIconInAddressBar != document.getElementById('showIcon').checked
         || gShortcutKey2URL.isShowListOfShortcutKey != document.getElementById('showList').checked);
}

var cancel = function() {
  if (isChangeSettings()) {
    if (confirm(s2u_mayiclose)) {
      closeDialogs();
      return true;
    }
    return false;
  }
}

var closeDialogs = function() {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
  var browserEnumerator = wm.getEnumerator(null);

  while (browserEnumerator.hasMoreElements()) {
    var w = browserEnumerator.getNext();
    if (w.name == 'shortcutKey2URL-addDialog' || w.name == 'shortcutKey2URL-editDialog') {
      w.close();
    }
  }
}

/////////////////////////////////////////////////////////////////

var exportSettings = function() {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  fp.init(window, s2u_exportfile, nsIFilePicker.modeSave);
  fp.defaultString = 'shortcutkey2url.settings';
  fp.appendFilter("*.settings", "*.settings");
  fp.appendFilters(nsIFilePicker.filterAll);

  var result = fp.show();

  if (result == Components.interfaces.nsIFilePicker.returnOK
      || result == Components.interfaces.nsIFilePicker.returnReplace) {

    var settings = JSON.stringify({
      settingData: gTreeView._data,
      startupKey: startupKey,
      receiveCharNumber: receiveCharNumber,
      isShowIconInAddressBar: document.getElementById('showIcon').checked,
      isShowListOfShortcutKey: document.getElementById('showList').checked
    });

    var fileStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                         .createInstance(Components.interfaces.nsIFileOutputStream);

    fileStream.init(fp.file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate

    var converterStream = Components
        .classes['@mozilla.org/intl/converter-output-stream;1']
        .createInstance(Components.interfaces.nsIConverterOutputStream);
    converterStream.init(fileStream, 'UTF-8', settings.length,
        Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

    converterStream.writeString(settings);

    converterStream.close();
    fileStream.close();
  }
}

var importSettings = function() {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  fp.init(window, s2u_importfile, nsIFilePicker.modeOpen);
  fp.appendFilter("*.settings", "*.settings");
  fp.appendFilters(nsIFilePicker.filterAll);

  var result = fp.show();

  if (result == Components.interfaces.nsIFilePicker.returnOK) {

    var fileStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                     .createInstance(Components.interfaces.nsIFileInputStream);
    fileStream.init(fp.file, 1, 0, false); // open as "read only"

    var converterStream = Components
        .classes['@mozilla.org/intl/converter-input-stream;1']
        .createInstance(Components.interfaces.nsIConverterInputStream);
    converterStream.init(fileStream, 'UTF-8', fileStream.available(),
        converterStream.DEFAULT_REPLACEMENT_CHARACTER);

    var out = {};
    converterStream.readString(fileStream.available(), out);

    var fileContents = out.value;

    converterStream.close();
    fileStream.close();

    try {
      var settings = JSON.parse(fileContents);
      initView(settings);
    } catch(e) {
      alert(s2u_fromatillegal);
    }
  }
}

/////////////////////////////////////////////////////////////////

var TreeView = function(aData) {
  this._data = aData;
}

TreeView.prototype = {

  _treeBoxObject: null,

  ////////////////////////////////////////////////////////////////
  // implements nsITreeView

  get rowCount() {
    return this._data.length;
  },
  selection: null,
  getRowProperties: function(index, properties) {},
  getCellProperties: function(row, col, properties) {},
  getColumnProperties: function(col, properties) {},
  isContainer: function(index) { return false; },
  isContainerOpen: function(index) { return false; },
  isContainerEmpty: function(index) { return false; },
  isSeparator: function(index) { return false; },
  isSorted: function() { return false; },
  canDrop: function(targetIndex, orientation) { return false; },
  drop: function(targetIndex, orientation) {},
  getParentIndex: function(rowIndex) { return -1; },
  hasNextSibling: function(rowIndex, afterIndex) { return false; },
  getLevel: function(index) { return 0; },
  getImageSrc: function(row, col) {},
  getProgressMode: function(row, col) {},
  getCellValue: function(row, col) {},
  getCellText: function(row, col) {
    switch (col.index) {
      case 0: 
        return this._data[row].key;
      case 1:
        return this._data[row].name || '';
      case 2:
        return this._data[row].url;
      case 3:
        return this._data[row].openMethod;
      default:
        return null;
    }
  },
  setTree: function(tree) {
    this._treeBoxObject = tree;
  },
  toggleOpenState: function(index) {},
  cycleHeader: function(col) {
    this._cycleHeader(col.element);
  },
  selectionChanged: function() {},
  cycleCell: function(row, col) {},
  isEditable: function(row, col) { return false; },
  isSelectable: function(row, col) {},
  setCellValue: function(row, col, value) {},
  setCellText: function(row, col, value) {
    switch (col.index) {
      case 0: 
        this._data[row].key = value;
        break;
      case 1:
        this._data[row].name = value;
        break;
      case 2:
        this._data[row].url = value;
        break;
      case 3:
        this._data[row].openMethod = value;
        break;
      default:
        break;
    }
  },
  performAction: function(action) {},
  performActionOnRow: function(action, row) {},
  performActionOnCell: function(action, row, col) {},

  //////////////////////////////////////////////////////

  _cycleHeader: function(elm) {

    // change sort direction
    var sortDir = elm.getAttribute('sortDirection');
    switch (sortDir) {
      case 'ascending':
        sortDir = 'descending';
        break;
      case 'descending':
        sortDir = 'ascending';
        break;
      default:
        sortDir = 'ascending';
        break;
    }

    this._setHeader(elm, sortDir);
  },
  _setHeader: function(elm, sortDir) {

    document.getElementById('keyColumn').setAttribute('sortDirection', 'natural');
    document.getElementById('urlColumn').setAttribute('sortDirection', 'natural');
    document.getElementById('nameColumn').setAttribute('sortDirection', 'natural');
    document.getElementById('openMethodColumn').setAttribute('sortDirection', 'natural');

    elm.setAttribute('sortDirection', sortDir);

    // sort data
    this.sortItems(elm.id, sortDir);
  },
  appendItem: function(aKey, aName, aURL, aOpenMethod) {
    this._data.push({key: aKey.toUpperCase(), name: aName, url: aURL, openMethod: aOpenMethod});
    var newIdx = this.rowCount - 1;
    this._treeBoxObject.rowCountChanged(newIdx, 1);

    // select the new item now
    this.selection.select(newIdx);
    this._treeBoxObject.ensureRowIsVisible(newIdx);
    this._treeBoxObject.treeBody.focus();
  },
  updateItem: function(aKey, aName, aURL, aOpenMethod) {
    var idx = this.selectedIndexes[0];
    this.setCellText(idx, {index: 0}, aKey.toUpperCase());
    this.setCellText(idx, {index: 1}, aName);
    this.setCellText(idx, {index: 2}, aURL);
    this.setCellText(idx, {index: 3}, aOpenMethod);

    this._treeBoxObject.rowCountChanged(idx, 0);
  },
  deleteItems: function() {
    var rows = this.selectedIndexes;
    for (var i = rows.length - 1; i >= 0; i--) {
      this.removeItemAt(rows[i]);
    }
  },
  get selectedIndexes() {
    var ret = [];
    var sel = this.selection;  // nsITreeSelection
    for (var rc = 0; rc < sel.getRangeCount(); rc++) {
      var start = {}, end = {};
      sel.getRangeAt(rc, start, end);
      for (var idx = start.value; idx <= end.value; idx++) {
        ret.push(idx);
      }
    }
    return ret;
  },
  removeItemAt: function(aRow) {
    this._data.splice(aRow, 1);
    this._treeBoxObject.rowCountChanged(aRow, -1);
    this.selection.clearSelection();
  },
  sortItems: function(aId, aSortDir) {

    var cmp = null;
    switch (aId) {
      case 'keyColumn':
        cmp = this.keyComparator;
        break;
      case 'nameColumn':
        cmp = this.nameComparator;
        break;
      case 'urlColumn':
        cmp = this.urlComparator;
        break;
      case 'openMethodColumn':
        cmp = this.openMethodComparator;
        break;
      default:
        break;
    }

    if (cmp) {
      this._data.sort(cmp);
    }

    if (aSortDir == 'descending') {
      this._data.reverse();
    }

    // refresh tree
    this._treeBoxObject.invalidate();
  },
  keyComparator: function(a, b) {
    if (a.key == b.key) {
      return (a.url > b.url) ? 1 : -1;
    } else {
      return (a.key > b.key) ? 1 : -1;
    }
  },
  nameComparator: function(a, b) {
    if (a.name == b.name) {
      return (a.key > b.key) ? 1 : -1;
    } else {
      return (a.name > b.name) ? 1 : -1;
    }
  },
  urlComparator: function(a, b) {
    if (a.url == b.url) {
      return (a.key > b.key) ? 1 : -1;
    } else {
      return (a.url > b.url) ? 1 : -1;
    }
  },
  openMethodComparator: function(a, b) {
    if (a.openMethod == b.openMethod) {
      return (a.key > b.key) ? 1 : -1;
    } else {
      return (a.openMethod > b.openMethod) ? 1 : -1;
    }
  },

  findDuplicateData: function(aKey, receiveCharNumber, aIgnore) {
    var aKey = aKey.toUpperCase();
    var data = null;
    for (var i = 0, len = this._data.length; i < len; i++) {
      if (this._data[i] != aIgnore
          && this._data[i].key.length <= receiveCharNumber
          && gShortcutKey2URL.checkDuplicate(aKey, this._data[i].key)) {
        data = this._data[i];
        break;
      }
    }
    return data;
  }

};


