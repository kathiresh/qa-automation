chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	alert("===called==")
	if (msg.ready === "ready") {
		if (confirm('Do you want to capture the screen?')) {
			sendResponse({download : "download"});


		}
	}
		
}); 