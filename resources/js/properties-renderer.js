const {
    ipcRenderer: ipc
} = require('electron');

$("#sonar-sources-selector").click(function () {
    ipc.send("sonar-sources");
});

ipc.on("selected-sonar-sources", function (event, dirPath) {
    $("#sonar-sources").focus();
    $("#sonar-sources").val(dirPath.replace(/\\/g, "/"));
    $("#sonar-sources").removeClass("invalid");
});

$("#saveProperties").click(function (event) {
    var propertiesData = {};
    var requiredFilled = true;
    $("input").each((index, elem) => {
        var key = elem.id.replace(/[-]/g, ".");
        var value = elem.value;
        elem.classList.remove("invalid");

        // Required check
        if (elem.required && value == "") {
            requiredFilled = false;
            elem.classList.add("invalid");
        }
        propertiesData[key] = value;
    });
    if (requiredFilled) {
        ipc.send("save-sonar-sources", propertiesData);
    }
});

ipc.on("saved-sonar-sources", function (event, response) {
    M.toast({
        html: response.message
    });
    if (response.status) {
        setTimeout(function () {
            window.location = "index.html";
        }, 2000);
    }
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
    ipc.send("openScanPage");
});

$(document).ready(function () {
    if (localStorage["title"]) {
        // Setting the page title
        $("#title").text(localStorage["title"]);
    }
    try {
        if (localStorage["sonar-properties"] && Object.keys(JSON.parse(localStorage["sonar-properties"])).length > 0) {
            // Filling the values in the property form
            var properties = JSON.parse(localStorage["sonar-properties"]);
            debugger;
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