var allOptions = ["network", "console", "screenshot"];

var port = chrome.extension.connect({
  name: "automation"
});

function startMonitoring() {
  var selectedOptions = [];
  var options = document.getElementById("resourceType");
  var chks = options.getElementsByTagName("input");
  for (var i = 0; i < chks.length; i++) {
    if (chks[i].checked) {
      selectedOptions.push(chks[i].value);
    }
  }
  if (selectedOptions.length > 0) {
    chrome.storage.sync.set({ selectedOptions: selectedOptions });
    chrome.storage.sync.set({ status: 'in_process' });
    document.getElementById("startMonitoring").disabled = true;
    document.getElementById("monitoring").style.display = 'block';
    port.postMessage({ action: 'start', params: selectedOptions });
  } else {
    alert("Please select atleast one.")
  }
}

function stopMonitoring() {
  document.getElementById("startMonitoring").disabled = false;
  document.getElementById("monitoring").style.display = 'none';
  chrome.storage.sync.set({ status: 'stop' });
  port.postMessage({ action: 'stop' });
}

document.getElementById('startMonitoring').addEventListener('click', startMonitoring);
document.getElementById('stopMonitoring').addEventListener('click', stopMonitoring);

function enableSelection(selectedOptions) {
  for (var i = 0; i < selectedOptions.length; i++) {
    document.getElementById(selectedOptions[i]).checked = true;
  }
}

// Set already selcted options 
chrome.storage.sync.get(['selectedOptions'], function (result) {
  if (result.selectedOptions) {
    enableSelection(result.selectedOptions);
  }
});

chrome.storage.sync.get(['status'], function (result) {
  if (result.status === 'in_process') {
    document.getElementById("startMonitoring").disabled = true;
    document.getElementById("monitoring").style.display = 'block';
  } else {
    document.getElementById("startMonitoring").disabled = false;
  }
});

