const {
  app,
  BrowserWindow,
  ipcMain: ipc,
  dialog
} = require('electron');
const PropertiesReader = require('properties-reader');
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  spawn
} = require('child_process');

let mainWindow;

const propertyDescriptions = {
  "sonar.host.url": "## Default SonarQube server",
  "sonar.login": "## Login Details",
  "sonar.projectKey": "## Project Details",
  "sonar.sources": "## Scan Source File Path Details"
}

app.on('ready', function () {
  // Creating the main application window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    },
    show: false
  });
  mainWindow.loadFile(path.join(__dirname, "..", "views", "index.html"));
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  // mainWindow.webContents.openDevTools();
});

// Event from client to load external property file
ipc.on("loadExternalProperty", function (event, args) {
  // Property file loading from disk
  dialog.showOpenDialog(mainWindow, {
    title: "Load Property File",
    filters: [{
        name: 'Properties',
        extensions: ['properties']
      },
      {
        name: 'All Files',
        extensions: ['*']
      }
    ]
  }, function (filePaths) {
    if (filePaths) {
      let filePath = filePaths[0];
      let properties = PropertiesReader(filePath);
      event.sender.send("loadedExternalProperty", properties.getAllProperties());
      mainWindow.loadFile(path.join(__dirname, "..", "views", "properties.html"));
    }
  });
});

// Event from client to load existing app properties
ipc.on("loadExistingProperty", function (event, args) {
  let properties = {};
  try {
    properties = PropertiesReader(path.join(__dirname, "..", "..", "node_modules", "sonar-scanner", "conf", "sonar-scanner.properties"));
    event.sender.send("loadedExistingProperty", properties.getAllProperties());
  } catch (e) {}
  mainWindow.loadFile(path.join(__dirname, "..", "views", "properties.html"));
});

// Event from client to initialize sonar properties before scan is executed
ipc.on("fetchScanProperties", function (event) {
  var dataToSend = {};
  if (fs.existsSync(path.join(__dirname, "..", "..", "node_modules", "sonar-scanner", "conf", "sonar-scanner.properties"))) {
    fs.readFile(path.join(__dirname, "..", "..", "node_modules", "sonar-scanner", "conf", "sonar-scanner.properties"), "utf8", (err, data) => {
      if (err) {
        dataToSend.status = false;
        dataToSend.data = err;
      } else {
        dataToSend.status = true;
        dataToSend.data = data;
      }
      event.sender.send("fetchedScanProperties", dataToSend);
    });
  } else {
    dataToSend.status = false;
    dataToSend.data = "No properties are defined in the system!";
    event.sender.send("fetchedScanProperties", dataToSend);
  }
});

// Event from client to trigger scan initialization
ipc.on("runScan", function (event, args) {
  mainWindow.loadFile(path.join(__dirname, "..", "views", "scan.html"));
});

// Event from client to invoke actual scan
ipc.on("startScan", function (event, args) {
  const proc = spawn(path.join(__dirname, "..", "..", "node_modules", "sonar-scanner", "bin", "sonar-scanner.bat"));

  proc.stdout.on("data", (data) => {
    event.sender.send("scanOutput", data.toString());
  });

  proc.stderr.on("data", (data) => {
    event.sender.send("scanOutput", data.toString());
  });
});

// Event from client to select sonar sources path
ipc.on("selectSonarSources", function (event, args) {
  dialog.showOpenDialog(mainWindow, {
    title: "Select Sonar Scan Source Path",
    properties: [
      'openDirectory'
    ]
  }, function (filePaths) {
    if (filePaths) {
      event.sender.send("selectedSonarSources", filePaths[0]);
    }
  });
});

// Event from client to save sonar properties
ipc.on("saveSonarProperties", function (event, propertiesData) {
  propertiesData = new Map(propertiesData);
  let propertyPath = path.join(__dirname, "..", "..", "node_modules", "sonar-scanner", "conf");
  if (fs.existsSync(propertiesData.get("sonar.sources"))) {
    propertiesData.set("sonar.projectBaseDir", propertiesData.get("sonar.sources"));

    fs.copyFileSync(path.join(propertyPath, "system.properties"), path.join(propertyPath, "sonar-scanner.properties"));

    let writer = fs.createWriteStream(path.join(propertyPath, "sonar-scanner.properties"), {
      "flags": "a"
    });

    for (let [key, value] of propertiesData) {
      if (value.trim() != "") {
        if (propertyDescriptions[key] != null) {
          writer.write(os.EOL + propertyDescriptions[key] + os.EOL);
        }
        writer.write(key + "=" + value + os.EOL);
      }
    }
    writer.end();

    event.sender.send("savedSonarProperties", {
      "status": true,
      "message": "sonar-scanner.properties saved successfully!"
    });
  } else {
    event.sender.send("savedSonarProperties", {
      "status": false,
      "message": "sonar.sources is not a valid path!"
    });
  }
});