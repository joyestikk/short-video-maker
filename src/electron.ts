import { app, BrowserWindow } from 'electron';
import path from 'path';
import waitOn from 'wait-on';

// Import the main function from index
import { main } from './index';

async function createWindow() {
  // Ensure the port is 3123 as requested by the user
  process.env.PORT = '3123';

  // Start the backend server
  try {
    // We don't await main here because it might perform long-running initialization
    // and we want to start wait-on in parallel if possible,
    // but actually main() in this project awaits a lot of things.
    // So we await it to make sure the server start is at least attempted.
    await main();
    console.log("Backend server initialization finished.");
  } catch (err) {
    console.error("Failed to start backend server:", err);
  }

  // Wait for the server to be ready before loading the URL
  try {
    console.log("Waiting for backend to be ready on port 3123...");
    await waitOn({
      resources: ['http://localhost:3123/health'],
      timeout: 60000, // 60 seconds timeout
    });
    console.log("Backend is ready!");
  } catch (err) {
    console.error("Backend server failed to become ready:", err);
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Short Video Maker",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:3123');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
