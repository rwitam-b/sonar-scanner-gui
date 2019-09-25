const ipc = require('electron').ipcRenderer;

// Button click to load existing property file
$("#loadProp").click(function () {
    ipc.send("loadExternalProperty");
});

// Button click to modify existing app properties
$("#modProp").click(function () {
    ipc.send("loadExistingProperty");
});

// Event back from server after external property file has been loaded
ipc.on("loadedExternalProperty", function (event, properties) {
    window.localStorage["sonar-properties"] = JSON.stringify(properties);
    window.localStorage["title"] = "Load External Property File";
});

// Event back from server after existing app properties have been loaded
ipc.on("loadedExistingProperty", function (event, properties) {
    window.localStorage["sonar-properties"] = JSON.stringify(properties);
    window.localStorage["title"] = "Modify SonarQube Properties";
});

// Event from server after initializing sonar properties(before scan execution)
ipc.on("fetchedScanProperties", (event, response) => {
    if (!response.status) {
        $("#modal1-agree").addClass("disabled");
    } else {
        $("#modal1-agree").removeClass("disabled");
    }
    $("#modalTitle").text(response.titleMessage);
    $("#modalProperties").text(response.data);
});

// Agree to run scan, after reviewing sonar properties
$("#modal1-agree").click(() => {
    window.localStorage.setItem("scanStatus", true);
    ipc.send("runScan");
});

$(document).ready(() => {
    window.localStorage.removeItem("sonar-properties");
    window.localStorage.removeItem("title");

    // Initializing "Run Scan" modal
    let elems = document.querySelectorAll('.modal');
    let instances = M.Modal.init(elems, {
        opacity: 0.5,
        inDuration: 700,
        outDuration: 700,
        dismissible: false,
        onOpenStart: function () {
            ipc.send("fetchScanProperties");
        }
    });
});