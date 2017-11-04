class KeyEventUtil {
  static hasModifiers(keyEvent) {
    return keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.shiftKey;
  }

  static toString(keyEvent) {

    var keys = [];
    
    // modifier
    if (keyEvent.altKey) keys.push('Alt');
    if (keyEvent.ctrlKey) keys.push('Ctrl');
    if (keyEvent.metaKey) keys.push('Meta');
    if (keyEvent.shiftKey) keys.push('Shift');

    // charCode
    if (keyEvent.charCode) {
      keys.push(String.fromCharCode(keyEvent.charCode).toUpperCase());
    }

    return keys.join('+');
  }

  static toValue(keyEvent) {
    return {
      'charCode': keyEvent.charCode,
      'keyCode': keyEvent.keyCode,
      'altKey': keyEvent.altKey,
      'ctrlKey': keyEvent.ctrlKey,
      'metaKey': keyEvent.metaKey,
      'shiftKey': keyEvent.shiftKey
    };
  }
}
