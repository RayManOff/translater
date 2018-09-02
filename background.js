chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        let response = {
            'status' : 'ok',
            'result' : ''
        };

        if (typeof request.text === 'undefined' || request.text === 0) {
            response.status = "error";
            response.result = "There is not text";
        } else {
            response.result = "Translate of " + request.text;
        }

        sendResponse(response);
    }
);

