
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
    if (object == null) {
      console.log('Failed!!');
      return;
    }
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
        if (gRequests.length === 0) {
          console.log("======allRequestssssssssssss===", Object.values(groupAllRequest));


        }
        if (response) {
          //  dispatch(source.tabId, object.target, JSON.parse(response.body));
        } else {
          console.log("Empty response for " + object.url);
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


chrome.extension.onConnect.addListener(function (port) {
  console.log("Connected ....................................");
  console.log("====tabId=====", tabId);

  port.onMessage.addListener(function (msg) {
    if (msg === "start") {

      if (tabId) {
        chrome.debugger.attach({
          tabId: tabId
        }, "1.0");
      }
      chrome.webRequest.onBeforeRequest.addListener(initialListener, { urls: ["https://dev.digicontent.io/*"] }, ["blocking"]);
    }
    if (msg === "stop") {

      // screenshot.init();
      var bb = [{ a: 23, b: 34 }];
      // var cc = [{
      //   headers: {
      //     "Referer": "https://dev.digicontent.io/catalogedge/",

      //   },
      //   method: "GET",
      //   requestBody: [],
      //   type: "Script",
      //   url: "https://dev.digicontent.io/catalogedge/app/settings/settings-module.js"
      // }]

      for (var key in groupAllRequest) {
        console.log("====groupAllRequest[key]===", groupAllRequest[key]);
        if (groupAllRequest[key].type) {
          filteredData.push(groupAllRequest[key]);
        }
      }
      var opts = [{ sheetid: 'One', header: true }, { sheetid: 'Two', header: false }];
      alasql('SELECT INTO XLSX("test.xlsx",?) FROM ?',
        [opts, [filteredData]]);
      filteredData = [];
      downloadScreenshot();
      // chrome.debugger.detach({
      //   tabId: tabId
      // });
    }
  });
})



function downloadScreenshot() {
  chrome.tabs.captureVisibleTab(null, function (img) {
    console.log("=========img=========", img)
    var element = document.createElement('a');
    element.setAttribute('href', img);
    element.setAttribute('download', "file.png");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  });
}