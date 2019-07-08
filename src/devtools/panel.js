document.addEventListener('DOMContentLoaded', function () {
  var networkCallsList = [];
  var constrcutedData = {};
  var selectedOptions = new Array();
  var link = document.getElementById('btnSubmit');
  link.addEventListener('click', function (event) {
    networkCallsList = [];
    var options = document.getElementById("resourceType");
    //Reference all the CheckBoxes in Table.
    var chks = options.getElementsByTagName("INPUT");
    for (var i = 0; i < chks.length; i++) {
      if (chks[i].checked) {
        selectedOptions.push(chks[i].value);
      }
    }

    if (selectedOptions.length > 0) {
      calltoDevTool();
    } else {
      alert("At least select one option to monitor");
    }

    function calltoDevTool() {
      networkCallsList = [];
      constrcutedData = {};
      constrcutedData.requestBody = {};
      constrcutedData.responseBody = {};
      chrome.devtools.network.onRequestFinished.addListener(
        function (request) {
          console.log("==request===", request);
          if (selectedOptions.indexOf(request._resourceType) >= 0) {
            constrcutedData.resourceType = request._resourceType;
            constrcutedData.url = request.request.url;
            var requestMock = {
              headers: request.request.headers,
              method: request.request.method
            }
            constrcutedData.requestBody = JSON.stringify(requestMock);
            request.getContent(function (body) {
              try {
                constrcutedData.responseBody = body;
                networkCallsList.push(constrcutedData);
              }
              catch (err) {
              }
            });
          }
        });
    }
  });

  var stopMonitor = document.getElementById('stopMonitor');
  stopMonitor.addEventListener('click', function (event) {
    if (networkCallsList.length) {
      var result = confirm("Would you like to download as Excel file ?");
      if (result == true) {
        var opts = [{ sheetid: 'One', header: true }, { sheetid: 'Two', header: false }];
        alasql('SELECT INTO XLSX("test.xlsx",?) FROM ?',
          [opts, [networkCallsList]]);

        networkCallsList = [];
      } else {
        networkCallsList = [];
      }
      if (selectedOptions.indexOf('screenshot') >= 0) {
        chrome.runtime.sendMessage({ takeScreenshot: true });
      }
    } else {
      alert("Nothing to monitor...")
    }
  });
});



