var gShortcutKey2URL = {

  receiveKey: function(aEvent) {

    if (gShortcutKey2URL.matchStartupKey(aEvent)) {
      // setting
      gShortcutKey2URL.openSetting();
      gShortcutKey2URL.endKeyReceive();
    } else {

      switch(aEvent.keyCode) {
        case  aEvent.DOM_VK_RETURN:
          // add url
          gShortcutKey2URL.endKeyReceive();
          gShortcutKey2URL.createShortcutKeyThisPage();
          break;

        case  aEvent.DOM_VK_ESCAPE:
          // stop key receive
          gShortcutKey2URL.endKeyReceive();
          break;

        default:
          gShortcutKey2URL.receivedCharBuffer.push(gShortcutKey2URL.getKeyString(aEvent));
          var data = gShortcutKey2URL.findSetting(gShortcutKey2URL.receivedCharBuffer.join(''));
          if (data) {
            gShortcutKey2URL.endKeyReceive();
            gShortcutKey2URL.openTab(data.url, data.openMethod);
          } else if (gShortcutKey2URL.receivedCharBuffer.length >= gShortcutKey2URL.receiveCharNumber) {
            gShortcutKey2URL.endKeyReceive();
          }
          break;
      }
    }
  },

  findSetting: function(aKey) {
    var aKey = aKey.toUpperCase();
    var setting = null;
    for (var i = 0, len = gShortcutKey2URL.settingData.length; i < len; i++) {
      if (aKey == gShortcutKey2URL.settingData[i].key) {
        setting = gShortcutKey2URL.settingData[i];
        break;
      }
    }
    return setting;
  },

  findDuplicateSetting: function(aKey) {
    var aKey = aKey.toUpperCase();
    var setting = null;
    for (var i = 0, len = gShortcutKey2URL.settingData.length; i < len; i++) {
      if (gShortcutKey2URL.settingData[i].key.length <= gShortcutKey2URL.receiveCharNumber
          && gShortcutKey2URL.checkDuplicate(aKey, gShortcutKey2URL.settingData[i].key)) {
        setting = gShortcutKey2URL.settingData[i];
        break;
      }
    }
    return setting;
  },

  openTab: function(aUrl, aOpenMethod) {

    switch(true) {
      case (aUrl.indexOf('javascript:') == 0):
        // javascript
        gShortcutKey2URL.dummyButton.onclick = function() {gBrowser.loadURI(aUrl);};
        gShortcutKey2URL.dummyButton.click();
        break;

      case (aUrl.indexOf('chromescript:') == 0):
        // chromescript
        (new Function(aUrl.substring('chromescript:'.length)))();
        break;

      default:

        switch(aOpenMethod) {
          case 'search':
            var tabs = gBrowser.tabContainer.childNodes;
            var target = null;

            for (var i = 0, len = tabs.length; i < len; i++) {
              if (tabs[i].linkedBrowser.currentURI.spec.indexOf(aUrl) == 0) {
                target = tabs[i];
                break;
              }
            }

            if (target == null) {
              target = gBrowser.addTab(aUrl);
            }
            gBrowser.selectedTab = target;
            break;

          case 'new':
            gBrowser.selectedTab = gBrowser.addTab(aUrl);
            break;

          case 'selected':
            gBrowser.loadURI(aUrl);
            break;

          default:
            break;
        }
    }
  },

  startKeyReceive: function() {
    //gBrowser.focus();

    gShortcutKey2URL.isActive = true;
    gShortcutKey2URL.addressbarIcon.src = 'chrome://shortcutkey2url/skin/icon-small-active.png';

    gShortcutKey2URL.receivedCharBuffer = [];

    if (gShortcutKey2URL.isShowListOfShortcutKey) {
      gShortcutKey2URL.showKeyListPanel();
    }

    if (!gShortcutKey2URL.isShowListOfShortcutKey) {
      gShortcutKey2URL.endKeyReceiveTimer = setTimeout(function() {
        gShortcutKey2URL.endKeyReceive();
      }, gShortcutKey2URL.receiveActiveTime);
    }
  },

  endKeyReceive: function() {
    if (gShortcutKey2URL.isActive) {
      gShortcutKey2URL.isActive = false;
      gShortcutKey2URL.addressbarIcon.src = 'chrome://shortcutkey2url/skin/icon-small-inactive.png';
      if (gShortcutKey2URL.endKeyReceiveTimer) {
        clearTimeout(gShortcutKey2URL.endKeyReceiveTimer);
        gShortcutKey2URL.endKeyReceiveTimer = null;
      }
      gShortcutKey2URL.keyListPanel.hidePopup();
    }
  },

  showKeyListPanel: function() {
    gShortcutKey2URL.removeChildNodes(gShortcutKey2URL.keyListPanel);

    var dummyFrameDocument = gShortcutKey2URL.dummyFrame.contentDocument;

    var grid = dummyFrameDocument.documentElement.appendChild(dummyFrameDocument.createElement('grid'));
    var columns = grid.appendChild(dummyFrameDocument.createElement('columns'));
    for (var i = 0; i < 3; i++) {
      var keyColumn = columns.appendChild(dummyFrameDocument.createElement('column'));
      var nameColumn = columns.appendChild(dummyFrameDocument.createElement('column'));
    }

    var rows = grid.appendChild(dummyFrameDocument.createElement('rows'));
    var row = null;
    for (var i = 0, len = gShortcutKey2URL.settingData.length; i < len; i++) {
      if (!row || i % 3 == 0) {
        row = rows.appendChild(dummyFrameDocument.createElement('row'));
      }
      var keyLabel = row.appendChild(dummyFrameDocument.createElement('label'));
      keyLabel.setAttribute('value', gShortcutKey2URL.settingData[i].key);
      keyLabel.className = 'shortcutKey2URL-keyListPanel-key';
      var nameLabel = row.appendChild(dummyFrameDocument.createElement('label'));
      nameLabel.setAttribute('value', gShortcutKey2URL.settingData[i].name);
      nameLabel.className = 'shortcutKey2URL-keyListPanel-name';
    }

    var x = document.documentElement.boxObject.screenX
            + (document.width / 2) - (grid.boxObject.width / 2);
    var y = document.documentElement.boxObject.screenY
            + (document.height / 2) - (grid.boxObject.height / 2);

    gShortcutKey2URL.keyListPanel.appendChild(grid);
    document.popupNode = null;
    gShortcutKey2URL.keyListPanel.showPopup(document.documentElement, x, y, 'popup', null, null);
  },

  createShortcutKeyThisPage: function() {
    window.openDialog('chrome://shortcutkey2url/content/add_dialog.xul', 'shortcutKey2URL-addDialog', 'centerscreen, chrome', gShortcutKey2URL, null, gShortcutKey2URL.receiveCharNumber, gBrowser.currentURI.spec, gBrowser.contentTitle);
  },

  createShortcutKeyContextLink: function() {
    window.openDialog('chrome://shortcutkey2url/content/add_dialog.xul', 'shortcutKey2URL-addDialog', 'centerscreen, chrome', gShortcutKey2URL, null, gShortcutKey2URL.receiveCharNumber, gContextMenu.getLinkURL(), gContextMenu.target.text || gContextMenu.target.alt);
  },

  init: function() {

    gShortcutKey2URL.addressbarIcon = document.getElementById('shortcutKey2URL-addressbarIcon');
    gShortcutKey2URL.dummyButton = document.getElementById('shortcutKey2URL-dummyButton');
    gShortcutKey2URL.keyListPanel = document.getElementById('shortcutKey2URL-keyListPanel');
    gShortcutKey2URL.dummyFrame = document.getElementById('shortcutKey2URL-dummyFrame');

    var prefSvc = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
    gShortcutKey2URL.prefBranch = prefSvc.getBranch('extensions.shortcutkey2url.');

    // use accel key
    switch (prefSvc.getBranch('').getIntPref('ui.key.accelKey')) {
      case 17:
        gShortcutKey2URL.accelKey = 'control';
        break;
      case 18:
        gShortcutKey2URL.accelKey = 'alt';
        break;
      case 224:
        gShortcutKey2URL.accelKey = 'meta';
        break;
      default:
        gShortcutKey2URL.accelKey = (window.navigator.platform.search('Mac') == 0) ? 'meta' : 'control';
        break;
    }

    gShortcutKey2URL.loadSetting();

    gShortcutKey2URL.changeAddressbarIconDisplay();

    window.addEventListener('keypress', gShortcutKey2URL.handleShortcutKey, true);

    var contextMenu = document.getElementById('contentAreaContextMenu');
    contextMenu.addEventListener('popupshowing', gShortcutKey2URL.handleContextMenu, false);
  },

  handleShortcutKey: function(aEvent) {

    if (gShortcutKey2URL.isActive) {
      gShortcutKey2URL.receiveKey(aEvent);

      aEvent.preventDefault();
      aEvent.stopPropagation();
    } else {
      if (gShortcutKey2URL.matchStartupKey(aEvent)) {

        gShortcutKey2URL.startKeyReceive();

        aEvent.preventDefault();
        aEvent.stopPropagation();
      }
    }
  },

  handleContextMenu: function(aEvent) {
    var contextMenuPage = document.getElementById('shortcutKey2URL-contextMenu-page');
    var contextMenuLink = document.getElementById('shortcutKey2URL-contextMenu-link');
  
    contextMenuLink.hidden = !(gContextMenu.onLink);
    contextMenuPage.hidden = gContextMenu.onLink;
  },

  matchStartupKey: function(aEvent) {
    return (gShortcutKey2URL.getModifiers(aEvent) == gShortcutKey2URL.startupKey.modifiers
               && gShortcutKey2URL.getKeyString(aEvent) == gShortcutKey2URL.startupKey.key);
  },

  getModifiers: function(aEvent) {

    var modifiers = [];

    if (aEvent.altKey) modifiers.push('alt');
    if (aEvent.ctrlKey) modifiers.push('control');
    if (aEvent.metaKey) modifiers.push('meta');
    if (aEvent.shiftKey) modifiers.push('shift');

    return modifiers.join(' ');
  },

  getKeyString: function(aEvent) {

    var keyString = null;
    if (aEvent.charCode) {
      keyString = String.fromCharCode(aEvent.charCode).toUpperCase();
    }

    return keyString;
  },

  loadSetting: function() {

    try {
      if (gShortcutKey2URL.prefBranch.prefHasUserValue('settingData')) {

        var settingDataStr = gShortcutKey2URL.getUnicodeStringPref('settingData');
        gShortcutKey2URL.settingData = JSON.parse(settingDataStr);
      } else {

        // install default
        gShortcutKey2URL.settingData = gShortcutKey2URL.defaultSettingData;
        gShortcutKey2URL.setUnicodeStringPref('settingData', JSON.stringify(gShortcutKey2URL.settingData));
      }
    } catch(e){
      gShortcutKey2URL.settingData = [];
    }
    gShortcutKey2URL.sortSettingData(gShortcutKey2URL.settingData);

    try {
      var startupKeyStr = gShortcutKey2URL.getUnicodeStringPref('startupKey');
      gShortcutKey2URL.startupKey = JSON.parse(startupKeyStr);
    } catch(e) {
      gShortcutKey2URL.startupKey = gShortcutKey2URL.defaultStartupKey;
    }

    try {
      gShortcutKey2URL.receiveCharNumber = gShortcutKey2URL.prefBranch.getIntPref('receiveCharNumber');
    } catch(e) {
      gShortcutKey2URL.receiveCharNumber = 1;
    }

    try {
      gShortcutKey2URL.isShowIconInAddressBar = gShortcutKey2URL.prefBranch.getBoolPref('showIconInAddressBar');
    } catch(e) {
      gShortcutKey2URL.isShowIconInAddressBar = true;
    }

    try {
      gShortcutKey2URL.isShowListOfShortcutKey = gShortcutKey2URL.prefBranch.getBoolPref('showListOfShortcutKey');
    } catch(e) {
      gShortcutKey2URL.isShowListOfShortcutKey = true;
    }

    try {
      gShortcutKey2URL.receiveActiveTime = gShortcutKey2URL.prefBranch.getIntPref('receiveActiveTime');
    } catch(e) {
      gShortcutKey2URL.receiveActiveTime = 5000; // 5000ms
    }
  },

  saveSetting: function() {
    gShortcutKey2URL.sortSettingData(gShortcutKey2URL.settingData);
    gShortcutKey2URL.setUnicodeStringPref('settingData', JSON.stringify(gShortcutKey2URL.settingData));
    gShortcutKey2URL.setUnicodeStringPref('startupKey', JSON.stringify(gShortcutKey2URL.startupKey));
    gShortcutKey2URL.prefBranch.setIntPref('receiveCharNumber', gShortcutKey2URL.receiveCharNumber);
    gShortcutKey2URL.prefBranch.setBoolPref('showIconInAddressBar', gShortcutKey2URL.isShowIconInAddressBar);
    gShortcutKey2URL.prefBranch.setBoolPref('showListOfShortcutKey', gShortcutKey2URL.isShowListOfShortcutKey);
    gShortcutKey2URL.prefBranch.setIntPref('receiveActiveTime', gShortcutKey2URL.receiveActiveTime);
  },

  setUnicodeStringPref: function(prefName, value) {

    var ustr = Cc['@mozilla.org/supports-string;1'].createInstance(Ci.nsISupportsString);
    ustr.data = value;

    gShortcutKey2URL.prefBranch.setComplexValue(prefName, Ci.nsISupportsString, ustr);
  },

  getUnicodeStringPref: function(prefName) {

    return gShortcutKey2URL.prefBranch.getComplexValue(prefName, Ci.nsISupportsString).data;
  },

  sortSettingData: function(settingData) {
    settingData.sort(
      function(a, b) {
        if (a.key == b.key) {
          return (a.url > b.url) ? 1 : -1;
        } else {
          return (a.key > b.key) ? 1 : -1;
        }
      });
    return settingData;
  },

  openSetting: function(aAddURL) {
    window.openDialog('chrome://shortcutkey2url/content/setting.xul', 'shortcutKey2URL-settingDialog', 'resizable, centerscreen, chrome', aAddURL);
  },

  loadBrowserShotcutKeys: function() {

    gShortcutKey2URL.browserShotcutKeys = {};

    var keys = document.getElementsByTagName('key');

    for (var i = 0, len = keys.length; i < len; i++) {
      if (!keys[i].hasAttribute('disabled') || keys[i].getAttribute('disabled') != false) {
        var shotcutKeyName = gShortcutKey2URL.createBrowserShotcutKeyName(keys[i].getAttribute('modifiers'), keys[i].getAttribute('key'), keys[i].getAttribute('keycode'));
        if (!gShortcutKey2URL.browserShotcutKeys[shotcutKeyName]) {
          gShortcutKey2URL.browserShotcutKeys[shotcutKeyName] = keys[i].id || '__dummy__';
        }
      }
    }
  },

  getBrowserShotcutKey: function(aModifiers, aKey, aKeycode) {
    if (!gShortcutKey2URL.browserShotcutKeys) {
      gShortcutKey2URL.loadBrowserShotcutKeys();
    }

    var shotcutKeyName = gShortcutKey2URL.createBrowserShotcutKeyName(aModifiers, aKey, aKeycode);
    return gShortcutKey2URL.browserShotcutKeys[shotcutKeyName];
  },

  createBrowserShotcutKeyName: function(aModifiers, aKey, aKeycode) {
    aModifiers = aModifiers || '';
    return aModifiers.replace('accel', gShortcutKey2URL.accelKey).replace(',', ' ').split(' ').sort().join('+') + '+' + (aKeycode || aKey).toUpperCase();
  },

  checkDuplicate: function(aKey1, aKey2) {
    if (aKey1.length > aKey2.length) {
      // switch
      var temp = aKey1;
      aKey1 = aKey2;
      aKey2 = temp;
    }

    return (aKey2.indexOf(aKey1) == 0);
  },

  changeAddressbarIconDisplay: function() {
    if (gShortcutKey2URL.isShowIconInAddressBar) {
      gShortcutKey2URL.addressbarIcon.style.display = '';
    } else {
      gShortcutKey2URL.addressbarIcon.style.display = 'none';
    }
  },

  removeChildNodes: function(parent) {
    while(parent.hasChildNodes()) {
      parent.removeChild(parent.lastChild);
    }
  },

  shutdown: function() {
    window.removeEventListener('keypress', gShortcutKey2URL.handleShortcutKey, true);

    var contextMenu = document.getElementById('contentAreaContextMenu');
    contextMenu.removeEventListener('popupshowing', gShortcutKey2URL.handleContextMenu, false);
  },

  defaultStartupKey: {modifiers: 'control', key: '.'},
  defaultSettingData: [{"key":"B","name":"Google Translate(javascript sample)","url":"javascript:var%20t=((window.getSelection&&window.getSelection())||(document.getSelection&&document.getSelection())||(document.selection&&document.selection.createRange&&document.selection.createRange().text));var%20e=(document.charset||document.characterSet);if(t!=''){location.href='http://translate.google.com/?text='+t+'&hl=ja&langpair=auto|en&tbb=1&ie='+e;}else{location.href='http://translate.google.com/translate?u='+encodeURIComponent(location.href)+'&hl=ja&langpair=auto|en&tbb=1&ie='+e;};","openMethod":"search"},{"key":"C","name":"Close All Tabs(chromescript sample)","url":"chromescript:gBrowser.removeAllTabsBut(gBrowser.addTab('about:blank'));","openMethod":"search"},{"key":"F","name":"Facebook","url":"https://www.facebook.com/","openMethod":"search"},{"key":"G","name":"Gmail","url":"https://mail.google.com/","openMethod":"search"},{"key":"T","name":"Twitter","url":"http://twitter.com/","openMethod":"search"}]
};
