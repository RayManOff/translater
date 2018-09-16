const URL = 'http://localhost:8080';

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message['request'] === 'dialogContents') {
      getDialogsContent(sendResponse)
  } else if (message['request']  === 'translate') {
      translate(message['params'] , sendResponse);
  } else {
      sendResponse({error : 'Unknown request' + message.request});
  }

  return true;
});

function getDialogsContent(handler) {
  let request = new Request('GET', URL + '/dialogContents');
  request.onload(handler);
  request.send();
}

function translate(params, handler) {
  let message = JSON.stringify({
    text: params['text'],
    left: params['left'],
    top: params['top']
  });

  let request = new Request('POST', URL + '/translate', message);
  request.setHeader('Content-type', 'application/json; charset=utf-8');
  request.onload(handler);
  request.send();
}

function Request(method, url, params = {}) {
  this.xht = new XMLHttpRequest();
  this.xht.open(method, url, true);
  this.params = params;

  let _this = this;

  this.onload = function (callback) {
    _this.xht.onload = function () {
      callback(JSON.parse(_this.xht.responseText));
    }
  };

  this.setHeader = function (header, value) {
    _this.xht.setRequestHeader(header, value);
  };

  this.send = function () {
    _this.xht.send(this.params);
  }
}

