chrome.devtools.panels.create("Automation",
    "",
    "src/devtools/panel.html",
    function(panel) {
        console.log("========panel=====",panel);
       // panel.createStatusBarButton();
      // code invoked on panel creation
    }
);
 
// chrome.devtools.network.onRequestFinished.addListener(
//     function(request) {
//         console.log("==request===", request);
//         console.log("====req res type===", request._resourceType);
//         request.getContent(function(body){
//             // parsed = JSON.parse(body);
//             console.log("=============parsedparsed=",parsed);
//           });
//     //   if (request.response.bodySize > 40*1024) {
//     //     chrome.devtools.inspectedWindow.eval(
//     //         'console.log("Large image: " + unescape("' +
//     //         escape(request.request.url) + '"))');
//     //   }
// });


// chrome.devtools.network.getHAR(function (detail) {
//     console.log("==detai========", detail);
// })

// function calltoDevTool() {
//     alert("=======calling super==");
// }
 