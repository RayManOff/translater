const URL = 'http://localhost:8000';

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message['request'] === 'getIcon') {
      getIcon(sendResponse)
  } else if (message['request']  === 'translate') {
      translate(message['params']['text'] , sendResponse);
  } else {
      sendResponse({error : 'Unknown request' + message.request});
  }

  return true;
});

function getIcon(handler) {
  let request = new Request('GET', URL + '/getIcon');
  request.onload(handler);
  request.send();
}

function translate(text, handler) {
  let params = [
    'text=' + text,
    'need_popup=1'
  ];

  let path = '/translate?' + params.join('&');
  console.log(path);
  let request = new Request('GET', URL + path);

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
      console.log(_this.xht.responseText);
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

