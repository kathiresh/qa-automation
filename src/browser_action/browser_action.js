var allOptions = ["xhr", "document", "script", "image", "font", "screenshot", "console"];

var port = chrome.extension.connect({
    name: "automation"
});

function startMonitoring() {
    var selectedOptions = [];
    var options = document.getElementById("resourceType");
    var chks = options.getElementsByTagName("input");
    for (var i = 0; i < chks.length; i++) {
        if (chks[i].checked) {
            selectedOptions.push(chks[i].value);
        }
    }
    chrome.storage.sync.set({ selectedOptions: selectedOptions });
    port.postMessage({ action: 'start', params: selectedOptions });
}

function stopMonitoring() {
    port.postMessage({ action: 'stop' });
}

function selectAll() {
    var isSelectAll = document.getElementById("selectAll").checked;
    if (isSelectAll) {
        enableSelection(allOptions);
    }
}

document.getElementById('startMonitoring').addEventListener('click', startMonitoring);
document.getElementById('stopMonitoring').addEventListener('click', stopMonitoring);
document.getElementById('selectAll').addEventListener('click', selectAll);

function enableSelection(selectedOptions) {
    for (var i = 0; i <= selectedOptions.length; i++) {
        document.getElementById(selectedOptions[i]).checked = true;
    }
}

// Set already selcted options 
chrome.storage.sync.get(['selectedOptions'], function (result) {
    if (result.selectedOptions) {
        enableSelection(result.selectedOptions);
    }
});

