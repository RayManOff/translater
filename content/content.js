class BackgroundClient extends MessageClient {
  static translate(text) {
    return this.request('translate', text);
  }

  static getIcon() {
    return this.request('getIcon', '');
  }
}

MODE_SELECT = 'select';
MODE_TRASLATE = 'translate';

class Dialog {
  constructor() {
    this.currentMode = MODE_SELECT;
  }

  init() {
    let _this = this;
    document.addEventListener('mouseup', event => {
      if (_this.currentMode === MODE_TRASLATE) {
        return;
      }
      if (_this.retrieveSelected()) {
        _this.showIcon();
      }
    });

    this.loadIconParams();
  }

  retrieveSelected() {
    let selected = window.getSelection();
    let text = selected.toString();
    if (selected.rangeCount !== 1 || text === '') {
      return false;
    }

    let range = selected.getRangeAt(0).cloneRange();
    range.collapse(true);
    let rects = range.getClientRects();

    this.selected = {
      text: selected.toString(),
      coordinate: {
        x: rects[0].left,
        y: rects[0].top
      }
    };

    return true;
  }

  async loadIconParams() {
    const response = await BackgroundClient.getIcon();
    if (response.status === false) {
      throw new Error('Cannot load icon params');
    }

    this.iconParams = response.icon;
  }

  showIcon() {
    if (this.iconParams === undefined) {
      console.log('There are no icon dialog params');
      return;
    }

    this.iconParams.attributes.style['left'] = 10 + 'px';
    this.iconParams.attributes.style['top'] = 10 + 'px';

    this.icon = this.createElement(this.iconParams);
    let _this = this;
    this.icon.onclick = function () {
      _this.icon.remove();
      _this.translate(_this.selected.text);
      _this.currentMode = MODE_SELECT;
    };

    document.body.appendChild(this.icon);
  }

  async translate(text) {
    const response = await BackgroundClient.translate(text);
    console.log(response);
  }

  createElement(params) {
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
}

window.onload = () => {
  let dialog = new Dialog();
  dialog.init();
};