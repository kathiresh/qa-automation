
var screenshot = {
  content: document.createElement("canvas"),
  data: '',

  init: function () {
    this.initEvents();
  },

  saveScreenshot: function () {
    var image = new Image();
    image.onload = function () {
      var canvas = screenshot.content;
      canvas.width = image.width;
      canvas.height = image.height;
      var context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);

      // save the image
      var link = document.createElement('a');
      link.download = "download.png";
      link.href = screenshot.content.toDataURL();
      link.click();
      screenshot.data = '';
    };
    image.src = screenshot.data;
  },

  initEvents: function () {
    chrome.tabs.captureVisibleTab(null, {
      format: "png",
      quality: 100
    }, function (data) {
      screenshot.data = data;
      screenshot.saveScreenshot();
    });
  }
};

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log("=========bbbbbbbbbbbb==========")
    if (request.takeScreenshot === true) {
      screenshot.init();
    }
  });






var gAttached = false;
var gRequests = [];
var gObjects = [];
var groupAllRequest = {};
var allRequests = [];
chrome.debugger.onEvent.addListener(function (source, method, params) {

  // console.log("=====source========", source)
  // console.log("=====method========", method)
  console.log("=====params====requestId====", params);
  if (!groupAllRequest[params.requestId]) {
    groupAllRequest[params.requestId] = {};
  }
  // groupAllRequest[params.requestId].responseBody = {};/
  console.log("====groupAllRequest 2==", groupAllRequest);

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
  console.log("==groupAllRequest===", groupAllRequest);
  if (method == "Network.requestWillBeSent") {
    // console.log("===requestWillBeSent==params========", params)
    // If we see a url need to be handled, push it into index queue
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
  //console.log("======method=======", gObjects)
  if (method == "Network.loadingFinished" && gObjects.length > 0) {
    // console.log("=========ddddddddddddddddddd")
    // Pop out the request object from both object queue and request queue
    var requestId = params.requestId;
    var object = null;
    for (var o in gObjects) {
      if (requestId == gObjects[o].requestId) {
        object = gObjects.splice(o, 1)[0];
        //  console.log("==========objectobjectobject===", object)
        break;
      }
    }
    // Usually loadingFinished will be immediately after responseReceived
    gRequests.splice(gRequests.indexOf(object.url), 1);
    // console.log("=====oooooooo====", params)
    chrome.debugger.sendCommand(
      source,
      "Network.getResponseBody",
      { "requestId": requestId },
      function (response) {
        console.log("=====response====", response)
        if (response) {
          groupAllRequest[requestId].responseBody = response.body;
          //  allRequests.push(groupAllRequest[requestId]);
          console.log("===groupAllRequest[requestId]groupAllRequest[requestId]==", groupAllRequest)
        }
      });
  }
}
);

var filteredData = [];
var tabId = "";
var initialListener = function (details) {
  // console.log("==calling initializiner====", details);
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

// Attach debugger on startup


// Filter if the url is what we want
function getTarget(url) {
  console.log("===urlll===", url)
  for (var i in TARGETS) {
    var target = TARGETS[i];
    // console.log("====target====", target)
    if (url.match(target.url)) {
      // console.log("====iiiiiiiiiiiiii====", i)
      return i;
    }
  }
  return -1;
}

const TARGETS = [
  { url: 'https://dev-api.digicontent.io/services/api/*', desc: 'target1' }
]

console.log("=====chrome.debuggerchrome.debugger===", chrome.debugger);

chrome.extension.onConnect.addListener(function (port) {
  console.log("Connected ....................................");
  console.log("====tabId=====", tabId);

  port.onMessage.addListener(function (msg) {
    console.log('========msg==', msg);
    if (msg === "start") {

      if (tabId) {
        chrome.debugger.attach({
          tabId: tabId
        }, "1.0");
      }
      chrome.webRequest.onBeforeRequest.addListener(initialListener, { urls: ["https://dev.digicontent.io/*"] }, ["blocking"]);
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { msg: "initConsole" }, function (response) {
          console.log('==res==', response);
        });
      });
    }
    if (msg === "stop") {
      for (var key in groupAllRequest) {
        console.log("====groupAllRequest[key]===", groupAllRequest[key]);
        if (groupAllRequest[key].type) {
          filteredData.push(groupAllRequest[key]);
        }
      }
      if (filteredData.length > 0) {
        var opts = [{ sheetid: 'One', header: true }, { sheetid: 'Two', header: false }];
        alasql('SELECT INTO XLSX("test.xlsx",?) FROM ?',
          [opts, [filteredData]]);
        filteredData = [];
      } else {
        alert("No network calls found...")
      }
     // downloadScreenshot();
      getConsoleMessages();
      // chrome.debugger.detach({
      //   tabId: tabId
      // });
    }


  });
})

var constants = {
  "console.logs": "Log",
  "console.errors": "Error",
  "console.infos":"Info"
}

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
      console.log("===consoleResult===", consoleResult);
      var opts = [{ sheetid: 'One', header: true }, { sheetid: 'Two', header: false }];
        alasql('SELECT INTO XLSX("test.xlsx",?) FROM ?',
          [opts, [consoleResult]]);
      
    });
  });

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









// chrome.tabs.executeScript({
//   code: '$("#theButton").click(function() { console.log("====Message from background script."); });'
// });