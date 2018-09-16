const MODE_SELECT = 'select';
const MODE_TRANSLATE = 'translate';

function Dialog() {
  this.text = '';

  this.left = null;
  this.top = null;

  this.mode = MODE_SELECT;

  this.dialogs = {};
  this.dialogContens = {};

  let _this = this;

  this.init = function () {
    document.addEventListener('mouseup', (event) => {
      if (_this.mode === MODE_TRANSLATE) {
        return;
      }

      let text = _this.getSelectedText();
      if (text === '' || text === undefined) {
        console.log('There is no selected text');
        return;
      }

      _this.text = text;
      _this.left = event.pageX;
      _this.top = event.pageY + 5;

      _this.showIcon();
      _this.mode = MODE_TRANSLATE;
    });

    _this.getDialogContents();
  };

  this.getDialogContents = function () {
    let message = {request: "dialogContents",};
    chrome.runtime.sendMessage(message, function (response) {
      if (response.status === false || response.dialogs === undefined) {
        console.log('Cannot get dialog contents');
        return;
      }

      for (let dialogType in response.dialogs) {
        if (response.dialogs.hasOwnProperty(dialogType)) {
          _this.dialogContens[dialogType] = response.dialogs[dialogType];
        }
      }
    });
  };

  this.translate = function () {
    let message = {
      request: "translate",
      params: {
        text: _this.text,
      }
    };

    chrome.runtime.sendMessage(message, function (response) {
      if (response['status'] === false) {
        console.log(response);
        return
      }

      _this.showTranslate(response['data'])
    });
  };

  this.showTranslate = function (params) {
    let popupParams = _this.dialogContens['popup'];
    if (popupParams === undefined) {
      console.log('There are no popup dialog params');
      return;
    }

    popupParams.attributes.style['left'] = _this.left + 'px';
    popupParams.attributes.style['top'] = _this.top + 'px';

    _this.popup = createElement(popupParams);
    _this.popup.innerHTML = params.content;

    document.body.appendChild(_this.popup);
  };

  this.showIcon = function () {
    let iconParams = _this.dialogContens['icon'];
    if (iconParams === undefined) {
      console.log('There are no icon dialog params');
      return;
    }

    iconParams.attributes.style['left'] = _this.left + 'px';
    iconParams.attributes.style['top'] = _this.top + 'px';

    _this.dialogs['icon'] = createElement(iconParams);
    _this.dialogs['icon'].onclick = function () {
      _this.dialogs['icon'].remove();
      _this.translate(_this.text);
      _this.mode = MODE_SELECT;
    };

    document.body.appendChild(_this.dialogs['icon']);
  };

  this.getSelectedText = function () {
    return window.getSelection().toString();
  };
}

function createElement(params) {
  let element = document.createElement(params.tag);
  let attributes = params.attributes;
  for (let attrName in attributes) {
    let value = '';
    if (typeof attributes[attrName] === 'object') {
      for (let key in attributes[attrName]) {
        if (attributes[attrName].hasOwnProperty(key)) {
          value += key + ': ' + attributes[attrName][key] + '; ';
        }
      }
    } else {
      value = attributes[attrName];
    }
    element.setAttribute(attrName, value);
  }

  if (params.content !== undefined) {
    element.innerHTML = params.content;
  }

  return element;
}

let dialog = new Dialog();
window.onload = dialog.init;