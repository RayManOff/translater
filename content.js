const MODE_SELECT = 'select';
const MODE_TRANSLATE = 'translate';

function Dialog() {
  this.selected = null;

  this.left = null;
  this.top = null;

  this.mode = MODE_SELECT;

  this.dialogs = {};
  this.iconParams = null;

  let _this = this;

  this.init = function () {
    document.addEventListener('mouseup', (event) => {
      if (_this.mode === MODE_TRANSLATE) {
        _this.translate();

        return;
      }

      let selected = _this.getSelected();
      if (selected === false) {
        return;
      }

      _this.text = selected.text;
      _this.left = selected.coordinate.x;
      _this.top = selected.coordinate.y;

      _this.showIcon();
      _this.mode = MODE_TRANSLATE;
    });

    _this.getIcon();
  };

  this.getIcon = function () {
    let message = {
      request: 'getIcon'
    };

    chrome.runtime.sendMessage(message, function (response) {
      if (response.status === false) {
        console.log('Cannot get icon');
        return;
      }

      _this.iconParams = response.icon;
    });
  };

  this.translate = function () {
    let message = {
      request: "translate",
      params: {
        text: _this.text,
      }
    };

    console.log(message);

    chrome.runtime.sendMessage(message, function (response) {
      if (response['status'] === false) {
        console.log(response);
        return
      }

      _this.showTranslate(response['popup'])
    });
  };

  this.showTranslate = function (popup) {
    if (popup === undefined) {
      console.log('There are no popup dialog params');
      return;
    }

    document.body.innerHTML += popup;
    popup = document.getElementsByClassName('rayman_translate_popup');
    popup.style = {left: _this.left + 'px', right: _this.right + 'px'};
    console.log(popup.style);
  };

  this.showIcon = function () {
    if (_this.iconParams === null) {
      console.log('There are no icon dialog params');
      return;
    }

    _this.iconParams.attributes.style['left'] = _this.left + 'px';
    _this.iconParams.attributes.style['top'] = _this.top + 'px';

    _this.dialogs['icon'] = createElement(_this.iconParams);
    _this.dialogs['icon'].onclick = function () {
      _this.dialogs['icon'].remove();
      _this.translate(_this.text);
      _this.mode = MODE_SELECT;
    };

    document.body.appendChild(_this.dialogs['icon']);
  };

  this.getSelected = function () {
    let selected = window.getSelection();
    let text = selected.toString();
    if (selected.rangeCount !== 1 || text === '') {
      return false;
    }

    let range = selected.getRangeAt(0).cloneRange();
    range.collapse(true);
    let rects = range.getClientRects();

    return {
      text: selected.toString(),
      coordinate: {
        x: rects[0].left,
        y: rects[0].top
      }
    };
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