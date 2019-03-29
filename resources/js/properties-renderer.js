const {
    ipcRenderer: ipc
} = require('electron');

$("#sonar-sources-selector").click(function () {
    ipc.send("sonar-sources");
});

ipc.on("selected-sonar-sources", function (event, dirPath) {
    $("#sonar-sources").focus();
    $("#sonar-sources").val(dirPath);
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

$(document).ready(function () {
    if (localStorage["title"]) {
        // Setting the page title
        $("#title").text(localStorage["title"]);
    }
    if (localStorage["sonar-properties"]) {
        // Filling the values in the property form
        var properties = JSON.parse(localStorage["sonar-properties"]);
        $("input").each((index, elem) => {
            var key = elem.id.replace(/[-]/g, ".");
            elem.focus();
            elem.value = properties[key];
            elem.classList.remove("invalid");

            // Required check
            if (elem.required && elem.value == "") {
                elem.classList.add("invalid");
            }
        });
    }
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