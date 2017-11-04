document.addEventListener('keypress', (event) => {
  chrome.runtime.sendMessage({target: 'background-content-event', value: KeyEventUtil.toValue(event)});
});
