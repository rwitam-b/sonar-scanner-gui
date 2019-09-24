const {
    ipcRenderer: ipc
} = require('electron');


ipc.on("runningScan", (event, response) => {
    $("#console").append(response);
    $("#console").scrollTop(document.getElementById("console").scrollHeight);
});

$(document).ready(() => {
    var scanStatus = window.localStorage.scanStatus;
    if (scanStatus) {
        ipc.send("runScan");
    } else {
        window.location = "index.html";
    }
    window.localStorage.removeItem("scanStatus");
});