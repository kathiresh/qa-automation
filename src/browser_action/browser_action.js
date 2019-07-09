
var port = chrome.extension.connect({
    name: "testCall"
});

function startMonitoring() {
    port.postMessage("start");
}


function stopMonitoring() {
    console.log("=========stop---------")
    port.postMessage("stop");
}

document.getElementById('startMonitoring').addEventListener('click', startMonitoring);
document.getElementById('stopMonitoring').addEventListener('click', stopMonitoring);

console.log("=========ssssssssssssssssssss", chrome.extension.getBackgroundPage().console.memory);
