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

ipc.on("loadProperty", function (event, args) {
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
      var filePath = filePaths[0];
      var properties = PropertiesReader(filePath);
      mainWindow.loadFile(path.join(__dirname, "..", "views", "properties.html"));
      event.sender.send("loadedProperty", properties.getAllProperties());
    }
  });
});

ipc.on("loadExistingProperty", function (event, args) {
  // Property file loading from disk
  var properties = PropertiesReader(path.join(__dirname, "..", "..", "node_modules", "sonar-scanner", "conf", "sonar-scanner.properties"));
  mainWindow.loadFile(path.join(__dirname, "..", "views", "properties.html"));
  event.sender.send("loadedExistingProperty", properties.getAllProperties());
});

ipc.on("sonar-sources", function (event, args) {
  // Dialogue to select the sonar sources folder
  dialog.showOpenDialog(mainWindow, {
    title: "Select Sonar Scan Source Path",
    properties: [
      'openDirectory'
    ]
  }, function (filePaths) {
    if (filePaths) {
      event.sender.send("selected-sonar-sources", filePaths[0]);
    }
  });
});

ipc.on("save-sonar-sources", function (event, propertiesData) {
  // Check whether sonar.sources exist
  if (fs.existsSync(propertiesData["sonar.sources"])) {
    // Save property file to disk
    var writer = fs.createWriteStream(path.join(__dirname, "..", "..", "node_modules", "sonar-scanner", "conf", "sonar-scanner.properties"));
    writer.write("# This property file has been generated from SonarQube GUI" + os.EOL)
    for (a of Object.keys(propertiesData)) {
      if (propertiesData[a].trim() != "") {
        writer.write(a + "=" + propertiesData[a] + os.EOL);
      }
    }
    writer.end();
    event.sender.send("saved-sonar-sources", {
      "status": true,
      "message": "sonar-scanner.properties saved successfully!"
    });
  } else {
    event.sender.send("saved-sonar-sources", {
      "status": false,
      "message": "sonar.sources is not a valid path!"
    });
  }
});

ipc.on("fetch-sonar-property", function (event) {
  var dataToSend = {};
  if (fs.existsSync(path.join(__dirname, "..", "..", "node_modules", "sonar-scanner", "conf", "sonar-scanner.properties"))) {
    fs.readFile(path.join(__dirname, "..", "..", "node_modules", "sonar-scanner", "conf", "sonar-scanner.properties"), "utf8", (err, data) => {
      if (err) {
        dataToSend.status = false;
        dataToSend.data = err;
      } else {
        dataToSend.status = true;
        dataToSend.data = data;
        event.sender.send("fetched-sonar-property", dataToSend);
      }
    });
  } else {
    dataToSend.status = false;
    dataToSend.data = "No properties are defined in the system!";
    event.sender.send("fetched-sonar-property", dataToSend);
  }
});

ipc.on("testing", function (event, args) {
  // const proc = spawn("java", ["Test"]);

  // proc.stdout.on("data", (data) => {
  //   event.sender.send("tested", `stdout: ${data}`);
  // });
});