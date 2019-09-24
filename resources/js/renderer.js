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

ipc.on("fetched-sonar-property", (event, response) => {
    if (!response.status) {
        $("#modal1-agree").addClass("disabled");
    } else {
        $("#modal1-agree").removeClass("disabled");
    }
    $("#confirm-properties").text(response.data);
});

$("#modal1-agree").click(() => {
    window.localStorage.setItem("scanStatus", true);
    ipc.send("openScanPage");
});

$(document).ready(() => {
    window.localStorage.removeItem("sonar-properties");
    window.localStorage.removeItem("title");

    // Initializing "Run Scan" modal
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {
        opacity: 0.5,
        inDuration: 700,
        outDuration: 700,
        dismissible: false,
        onOpenStart: function () {
            ipc.send("fetch-sonar-property");
        }
    });
});