class MessageServer {
  constructor() {
    chrome.runtime.onMessage.addListener((request, sender, respond) => {
      console.log(request);
      (async () => {
        const method = request.command;
        console.log(request);
        const result = await this[method](...request.params) || {};
        console.log(result);
        respond(result);
      })();

      return true;
    });
  }
}

class MessageClient {
  static request(command, args) {
    console.log(args);
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ command: command, params: Array.from(args) }, result => {
        resolve(result);
      });
    });
  }
}