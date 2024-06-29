import { app, BrowserWindow, dialog, ipcMain, shell } from "electron"
const { readFileSync, writeFile } = require("fs")
const xml2js = require('xml2js')

var configFile = JSON.parse(readFileSync("./resources/config.json"))

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// const isDev = process.env.ELECTRON_ENV !== "development"

let isDev = false

function createWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1100 : 550,
    height: 850,
    backgroundColor: "#191622",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    frame: false,
    resizable: false,
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send("Loaded", configFile);
  });
}

function registerListeners() {
  ipcMain.on("message", (_, message, data, data2) => {
    switch (message) {
      case "appQuit":
        app.quit();
        break;
      case "appMinimize":
        mainWindow?.minimize();
        break;
      case "discord":
        shell.openExternal(data);
        break;
      case "generate":
        saveFile(data);
        break;
      case "openFile":
        getFile();
        break;
      default:
        console.warn("Unknown message received:", message);
        break;
    }
  });
}

app.whenReady()
  .then(createWindow)
  .then(registerListeners)
  .catch((e) => console.error(e));

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


const doorXML = (data: any[]) =>
  data.reduce((result, item) => {
    return (
      result +
      `\n    <Item type="Door" ntOffset="0">\n      <Name>d_${item.doorName}</Name>\n      <SoundSet>${item.soundSet}</SoundSet>\n      <Params>${item.Params}</Params>\n      <Unk1 value="${item.value}" />\n    </Item>`
    );
  }, "");

const doorModelXML = (data: any[]) =>
  data.reduce((result, item) => {
    return (
      result +
      `\n    <Item type="DoorModel" ntOffset="0">\n      <Name>dasl_${item.doorHash}</Name>\n      <Door>d_${item.doorName}</Door>\n    </Item>`
    );
  }, "");


const nameTableXML = (data: any[]) =>
  data.reduce((result, item) => {
    return result + `d_${item.doorName}\n`;
  }, "");

function saveFile(data: any[]) {
  dialog
    .showSaveDialog({ defaultPath: "c:/door_test_game.dat151.rel.xml" })
    .then(({ filePath }) => {
      if (!filePath) return;
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Dat151>\n  <Version value="9458585" />\n  <Items>${doorXML(data)}${doorModelXML(data)}\n  </Items>\n</Dat151>`;
      writeFile(filePath, xml, (err: any) => {
        if (err) {
          console.error(err);
        } else {
          dialog
            .showSaveDialog({ defaultPath: "c:/door_test_game.dat151.nametable" })
            .then(({ filePath: nameTablePath }) => {
              if (!nameTablePath) return;
              const nameTable = nameTableXML(data);
              writeFile(nameTablePath, nameTable, (err: any) => {
                if (err) {
                  console.error(err);
                }
              });
            });
        }
      });
    });
}

function getFile() {
  dialog
    .showOpenDialog({ properties: ["openFile"] })
    .then(({ filePaths }) => {
      if (!filePaths || filePaths.length === 0) return;
      const fileData = readFileSync(filePaths[0]);
      xmlToJSON(fileData).catch((err) => console.error("Error parsing XML", err));
    });
}

async function xmlToJSON(data: any) {
  xml2js.parseString(data, (err:any, result:any) => {
    if (err) {
      console.error("Error converting XML to JSON", err);
      return;
    }
    mainWindow?.webContents.send("xmlData", result);
  });
}