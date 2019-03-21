const ipc = require('electron').ipcRenderer;

$("#loadProp").click(function () {
    ipc.send("loadProperty");
});

ipc.on("loadedProperty", function (event, properties) {
    window.localStorage["sonar-properties"] = JSON.stringify(properties);
});

$("#modProp").click(function () {
    ipc.send("loadExistingProperty");
});

ipc.on("loadedExistingProperty", function (event, properties) {
    window.localStorage["sonar-properties"] = JSON.stringify(properties);
});