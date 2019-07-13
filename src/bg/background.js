var gAttached = false;
var gRequests = [];
var gObjects = [];
var groupAllRequest = {};
var allRequests = [];
var filteredData = [];
var tabId = "";
var selectedOptions = [];

var constants = {
  "console.logs": "Log",
  "console.errors": "Error",
  "console.infos": "Info"
}
const TARGETS = [
  { url: 'https://dev-api.digicontent.io/services/api/*', desc: 'target1' }
]

chrome.debugger.onEvent.addListener(function (source, method, params) {
  console.log("=====params=======", params.type);
  // if(selectedOptions.indexOf(params.type)) {
  if (!groupAllRequest[params.requestId]) {
    groupAllRequest[params.requestId] = {};
  }

  if (params.request) {
    groupAllRequest[params.requestId].type = params.type
    groupAllRequest[params.requestId].headers = JSON.stringify(params.request.headers);
    groupAllRequest[params.requestId].method = params.request.method;
    groupAllRequest[params.requestId].url = params.request.url;
    groupAllRequest[params.requestId].requestBody = [];
    if (params.request.method === "POST") {
      groupAllRequest[params.requestId].requestBody = params.request.postData;
    }
  }
  if (method == "Network.requestWillBeSent") {
    var rUrl = params.request.url;
    if (getTarget(rUrl) >= 0) {
      gRequests.push(rUrl);
    }
  }

  if (method == "Network.responseReceived") {
    // We get its request id here, write it down to object queue
    var eUrl = params.response.url;
    var target = getTarget(eUrl);
    if (target >= 0) {
      gObjects.push({
        requestId: params.requestId,
        target: target,
        url: eUrl
      });
    }
  }
  if (method == "Network.loadingFinished" && gObjects.length > 0) {
    // Pop out the request object from both object queue and request queue
    var requestId = params.requestId;
    var object = null;
    for (var o in gObjects) {
      if (requestId == gObjects[o].requestId) {
        object = gObjects.splice(o, 1)[0];
        break;
      }
    }
    // Usually loadingFinished will be immediately after responseReceived
    gRequests.splice(gRequests.indexOf(object.url), 1);
    chrome.debugger.sendCommand(
      source,
      "Network.getResponseBody",
      { "requestId": requestId },
      function (response) {
        console.log("=====response====", response)
        if (response) {
          groupAllRequest[requestId].responseBody = response.body;
        }
      });
  }
});

var initialListener = function (details) {
  if (gAttached) return;  // Only need once at the very first request, so block all following requests
  tabId = details.tabId;
  if (tabId > 0) {
    gAttached = true;
    chrome.debugger.attach({
      tabId: tabId
    }, "1.0", function () {
      chrome.debugger.sendCommand({
        tabId: tabId
      }, "Network.enable");
    });
    // Remove self since the debugger is attached already
    chrome.webRequest.onBeforeRequest.removeListener(initialListener);
  }
};

// Filter if the url is what we want
function getTarget(url) {
  console.log("===urlll===", url)
  for (var i in TARGETS) {
    var target = TARGETS[i];
    if (url.match(target.url)) {
      return i;
    }
  }
  return -1;
}

chrome.extension.onConnect.addListener(function (port) {
  console.log("Connected ....................................");
  console.log("====tabId=====", tabId);

  port.onMessage.addListener(function (msg) {
    console.log('========msg==', msg);
    if (msg.action === "start") {
      selectedOptions = msg.params;
      console.log("==selectedOptions=", selectedOptions);
      if (tabId) {
        chrome.debugger.attach({
          tabId: tabId
        }, "1.0");
      }
      chrome.webRequest.onBeforeRequest.addListener(initialListener, { urls: ["https://dev.digicontent.io/*"] }, ["blocking"]);
      if (selectedOptions.indexOf('console') >= 0) {
        console.log('=enablinggggggggggggggggggg');
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { msg: "initConsole" }, function (response) {
            console.log('==res==', response);
          });
        });
      }
    }
    if (msg.action === "stop") {
      console.log('=======selectedOptions====stop==', selectedOptions);
      for (var key in groupAllRequest) {
        console.log("====groupAllRequest[key]===", groupAllRequest[key]);
        if (groupAllRequest[key].type) {
          filteredData.push(groupAllRequest[key]);
        }
      }
      if (filteredData.length > 0) {
        downloadAsExcel('api', filteredData);
        filteredData = [];
      } else {
        alert("No network calls found...")
      }

      if (selectedOptions.indexOf('screenshot') >= 0) {
        downloadScreenshot();
      }
      if (selectedOptions.indexOf('console') >= 0) {
        getConsoleMessages();
      }
      // chrome.debugger.detach({
      //   tabId: tabId
      // });
    }
  });
})



function getConsoleMessages() {
  console.log('===getConsoleMessages=inside console block=====');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { msg: "getConsole" }, function (response) {
      console.log('==res==', response);
      var consoleResult = [];
      var consoleObj = {};
      for (var key in response) {
        console.log("====groupAllRequest[key]===", response[key]);
        var msgs = response[key];
        if (msgs.length) {
          consoleObj = {};
          for (var msg in msgs) {
            consoleObj.type = constants[key];
            consoleObj.message = msgs[msg][0];
            consoleResult.push(consoleObj);
          }
        }
      }
      if (consoleResult.length) {
        downloadAsExcel('console', consoleResult);
      }
    });
  });

}

function downloadAsExcel(fileName, data) {
  fileName = fileName || 'file';
  var opts = [{ sheetid: 'One', header: true }];
  alasql('SELECT INTO XLSX("' + fileName + '",?) FROM ?',
    [opts, [data]]);
}


function downloadScreenshot() {
  chrome.tabs.captureVisibleTab(null, function (img) {
    var element = document.createElement('a');
    element.setAttribute('href', img);
    element.setAttribute('download', "screenshot.png");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  });
}