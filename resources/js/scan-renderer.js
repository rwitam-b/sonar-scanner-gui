const {
    ipcRenderer: ipc
} = require('electron');

// Event from server which sends the running scan's terminal output
ipc.on("scanOutput", (event, response) => {
    $("#console").append(response);
    $("#console").scrollTop(document.getElementById("console").scrollHeight);
});

$(document).ready(() => {
    var scanStatus = window.localStorage.scanStatus;
    if (scanStatus) {
        ipc.send("startScan");
    } else {
        window.location = "index.html";
    }
    window.localStorage.removeItem("scanStatus");
});