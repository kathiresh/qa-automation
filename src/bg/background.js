// var currentTab;
// var version = "1.0";
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

// console.log("===chrome.tab===", chrome.tabs)
// chrome.tabs.query( //get current Tab
//     {
//         currentWindow: true,
//         active: true
//     },
//     function(tabArray) {
//         currentTab = tabArray[0];
//         console.log("===currentTab===", currentTab)
//         chrome.debugger.attach({ //debug at current tab
//             tabId: currentTab.id
//         }, version, onAttach.bind(null, currentTab.id));
//     }
// )


// function onAttach(tabId) {
//   console.log("===tabId===", tabId)
//     chrome.debugger.sendCommand({ //first enable the Network
//         tabId: tabId
//     }, "Network.enable");

//     chrome.debugger.onEvent.addListener(allEventHandler);

// }


// function allEventHandler(debuggeeId, message, params) {

//     if (currentTab.id != debuggeeId.tabId) {
//         return;
//     }

//     if (message == "Network.responseReceived") { //response return 
//         chrome.debugger.sendCommand({
//             tabId: debuggeeId.tabId
//         }, "Network.getResponseBody", {
//             "requestId": params.requestId
//         }, function(response) {console.log("===response===", response)
//             // you get the response body here!
//             console.log('=====bbbb',atob(response.body))
//             // you can close the debugger tips by:
//             //chrome.debugger.detach(debuggeeId);
//         });
//     }

// }}); 