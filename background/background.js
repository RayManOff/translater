const URL = 'http://localhost:8000';

class BackgroundServer extends MessageServer {
  async getIcon() {
    let response = await fetch(URL + '/getIcon');
    return await response.json();
  }

  async translate(text) {
    const params = [
      'text=' + text,
      'need_popup=1'
    ];

    const path = '/translate?' + params.join('&');
    let response = await fetch(URL + path);
    return await response.json();
  }
}

let server = new BackgroundServer();

