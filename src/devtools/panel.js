document.addEventListener('DOMContentLoaded', function () {
  var allReq = [];
  var link = document.getElementById('btnSubmit');
  // onClick's logic below:
  link.addEventListener('click', function (event) {
    //Create an Array.
    var selected = new Array();

    //Reference the Table.
    var tblFruits = document.getElementById("resourceType");

    //Reference all the CheckBoxes in Table.
    var chks = tblFruits.getElementsByTagName("INPUT");
    console.log("==chks====", chks);
    // Loop and push the checked CheckBox value in Array.
    for (var i = 0; i < chks.length; i++) {
      if (chks[i].checked) {
        selected.push(chks[i].value);
      }
    }
    console.log("==selected====", selected);
    //Display the selected CheckBox values.
    if (selected.length > 0) {
      alert("==allReq=="+ allReq.length);
      alert("Selected values: " + selected.join(","));
    }
    chrome.storage.sync.set({ "myKey": selected })
    var storageData;
    chrome.storage.sync.get("myKey", function (obj) {
      console.log("===myKey====", obj);
      storageData = obj.myKey;
      allReq = [];
      calltoDevTool();
    });


    
    function calltoDevTool() {
      allReq = [];
      chrome.devtools.network.onRequestFinished.addListener(
        function (request) {
       //   console.log("==request===", request);
        //  console.log("====req res type===", request._resourceType);
          request.getContent(function (body) {
            // parsed = JSON.parse(body);
            allReq.push(JSON.parse(body));
          //  console.log("=============parsedparsed=", parsed);
          });
          //   if (request.response.bodySize > 40*1024) {
          //     chrome.devtools.inspectedWindow.eval(
          //         'console.log("Large image: " + unescape("' +
          //         escape(request.request.url) + '"))');
          //   }
          console.log("==allReq========", allReq);
        });     

    }
  });
});