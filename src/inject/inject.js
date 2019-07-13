function insertConsole() {
    var consoleScript = document.createElement('script');
    consoleScript.innerHTML = "console.stdlog = console.log.bind(console);console.stdlog1 = console.log.bind(console);" +
        "console.logs = [];console.log = function(){console.logs.push(Array.from(arguments)); " +
        "console.stdlog.apply(console, arguments);};" +
        "console.errors = [];console.error = function(){console.errors.push(Array.from(arguments)); " +
        "console.stdlog.apply(console, arguments);};" +
        "console.infos = [];console.info = function(){console.infos.push(Array.from(arguments)); " +
        "console.stdlog.apply(console, arguments);};"
    document.body.appendChild(consoleScript);
}

function retrieveWindowVariables(variables) {
    console.log("===variablesvariables==", variables);
    var ret = {};

    var scriptContent = "";
    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        scriptContent += "if (typeof " + currVariable + " !== 'undefined') $('body').attr('tmp_" + currVariable + "', JSON.stringify(" + currVariable + "));\n"
    }

    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);

    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        console.log("======currVariable=====", currVariable);
        ret[currVariable] = $.parseJSON($("body").attr("tmp_" + currVariable));
        $("body").removeAttr("tmp_" + currVariable);
    }

    $("#tmpScript").remove();
    console.log("=rrrrr===", ret)
    return ret;
}


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('=============request===', request);
        console.log('=============sender===', sender);
        console.log('=============sendResponse===', sendResponse);
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.msg == "initConsole") {
            insertConsole();
        }

        if (request.msg == "getConsole") {
            sendResponse(retrieveWindowVariables(["console.logs", "console.errors", "console.infos"]));
        }
    });