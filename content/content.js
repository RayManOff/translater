class BackgroundClient extends MessageClient {
  static translate(text) {
    return this.request('translate', text);
  }

  static getIcon() {
    return this.request('getIcon', '');
  }
}

MODE_SELECTING = 'selecting';
MODE_SELECTED = 'selected';
MODE_TRASLATED = 'translated';

class Dialog {
  constructor() {
    this.currentMode = MODE_SELECTING;
    this.iconParams = null;
    this.iconElement = null;
    this.popupElement = null;
  }

  init() {
    let _this = this;
    document.addEventListener('mouseup', event => {
      console.log(_this.currentMode);
      if (_this.currentMode === MODE_TRASLATED) {
        if (_this.popupElement !== null) {
          _this.popupElement.remove();
          _this.popupElement = null;
        }

        _this.currentMode = MODE_SELECTING;

        return;
      }

      if (_this.currentMode === MODE_SELECTED) {
        return;
      }

      if (_this.retrieveSelected()) {
        _this.showIcon();
        _this.currentMode = MODE_SELECTED;
      } else {
        if (_this.iconElement !== null) {
          _this.iconElement.remove();
          _this.iconElement = null;
        }
        _this.currentMode = MODE_SELECTING;
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
    if (response.success === false) {
      throw new Error('Cannot load icon params');
    }

    this.iconParams = response.icon;
  }

  showIcon() {
    if (!this.iconParams) {
      console.log('There are no icon dialog params');
      return;
    }

    this.iconParams.attributes.style['left'] = 10 + 'px';
    this.iconParams.attributes.style['top'] = 10 + 'px';

    this.iconElement = this.createElement(this.iconParams);
    let _this = this;
    this.iconElement.onclick = () => {
      console.log('Translating');
      _this.iconElement.remove();
      _this.iconElement = null;
      _this.translate(_this.selected.text);
      _this.currentMode = MODE_TRASLATED;
    };

    document.body.appendChild(this.iconElement);
  }

  async translate(text) {
    const response = await BackgroundClient.translate(text);
    if (response.success === false) {
      throw new Error('Cannot translate');
    }

    let _this = this;
    this.popupElement = this.createElementFromHTML(response.popup);
    document.body.appendChild(this.popupElement);
    document.getElementById('close_translate_popup').onclick = () => {
      _this.popupElement.remove();
      _this.popupElement = null;
      _this.currentMode = MODE_SELECTING;
    };
  }

  createElementFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    return div.firstChild;
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