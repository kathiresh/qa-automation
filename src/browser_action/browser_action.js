
var port = chrome.extension.connect({
    name: "automation"
});

function startMonitoring() {
    port.postMessage("start");
}


function stopMonitoring() {
    console.log("=========stop---------")
    port.postMessage("stop");
}


function getConsole() {
    console.log("=========stop---------")
    port.postMessage("console");
}
document.getElementById('startMonitoring').addEventListener('click', startMonitoring);
document.getElementById('stopMonitoring').addEventListener('click', stopMonitoring);
document.getElementById('console').addEventListener('click', getConsole);

console.log("=========ssssssssssssssssssss", chrome.extension.getBackgroundPage().console.memory);



