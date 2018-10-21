const BASE_URL = 'http://localhost:8000';

class BackgroundServer extends MessageServer {
  async getIcon() {
    let response = await fetch(BASE_URL + '/getIcon');
    return await response.json();
  }

  async translate(text) {
    const params = [
      'text=' + text,
      'need_popup=1'
    ];

    const path = '/translate?' + params.join('&');
    let response = await fetch(BASE_URL + path);
    return await response.json();
  }
}

new BackgroundServer();