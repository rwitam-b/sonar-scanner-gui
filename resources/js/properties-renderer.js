const {
    ipcRenderer: ipc
} = require('electron');

// Button click to select sonar sources path
$("#sonar-sources-selector").click(function () {
    ipc.send("selectSonarSources");
});

// Button click to save sonar properties in app
$("#saveProperties").click(function (event) {
    // let propertiesData = {};
    let propertiesData = new Map();
    let requiredFilled = true;
    $("input").each((index, elem) => {
        let key = elem.id.replace(/[-]/g, ".");
        let value = elem.value;
        elem.classList.remove("invalid");

        // Required check
        if (elem.required && value == "") {
            requiredFilled = false;
            elem.classList.add("invalid");
        }
        // propertiesData[key] = value;
        propertiesData.set(key, value);
    });
    if (requiredFilled) {
        ipc.send("saveSonarProperties", Array.from(propertiesData.entries()));
    }
});

// Event back from server after sonar sources path has been selected
ipc.on("selectedSonarSources", function (event, dirPath) {
    $("#sonar-sources").focus();
    $("#sonar-sources").val(dirPath.replace(/\\/g, "/"));
    $("#sonar-sources").removeClass("invalid");
});

// Event back from server after sonar properties have been saved
ipc.on("savedSonarProperties", function (event, response) {
    M.toast({
        html: response.message
    });
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

$(document).ready(function () {
    if (localStorage["title"]) {
        // Setting the page title
        $("#title").text(localStorage["title"]);
    }
    try {
        if (localStorage["sonar-properties"] && Object.keys(JSON.parse(localStorage["sonar-properties"])).length > 0) {
            // Filling the values in the property form
            let properties = JSON.parse(localStorage["sonar-properties"]);
            for (property in properties) {
                let elemId = property.replace(/[.]/g, "-");
                let elem = $("#" + elemId);
                elem.focus();
                elem.val(properties[property]);
                elem.removeClass("invalid");
            }
            $("input").each((index, elem) => {
                // Required check
                if (elem.required && elem.value == "") {
                    elem.classList.add("invalid");
                }
            });
        }
    } catch (e) {}
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