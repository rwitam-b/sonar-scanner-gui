const ipc = require('electron').ipcRenderer;

$("#loadProp").click(function () {
    ipc.send("loadProperty");
});

ipc.on("loadedProperty", function (event, properties) {
    window.localStorage["sonar-properties"] = JSON.stringify(properties);
    window.localStorage["title"] = "Load External Property File";
});

$("#modProp").click(function () {
    ipc.send("loadExistingProperty");
});

ipc.on("loadedExistingProperty", function (event, properties) {
    window.localStorage["sonar-properties"] = JSON.stringify(properties);
    window.localStorage["title"] = "Modify SonarQube Properties";
});