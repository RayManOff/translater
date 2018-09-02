
document.addEventListener('mouseup', () => {
    let text = getSelectionText();
    if (text.length > 0) {
        sendMsgToBackground(text);
    }
}, false);

function getSelectionText(){
    let selectedText = "";
    let selection = window.getSelection;
    if (selection) {
        selectedText = selection().toString()
    }

    return selectedText
}

function sendMsgToBackground(text) {
    chrome.runtime.sendMessage({text: text}, function(response) {
        console.log(response);
    });
}