/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const steamworks = require('steamworks.js');

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

// TODO: add achievement thing here...
//   // TODO: on achievement, call steam api...
window.onAchieve = function(achievementName) {
  console.log(achievementName);
};

window.restart = function() {
  if (confirm("Do you wish to restart the game? Progress will not be saved.")) {
    window.location.reload();
    return false;
  }
};

window.exit = function() {
  if (confirm("Do you wish to exit the game? Progress will not be saved.")) {
    const { app, BrowserWindow } = require('electron');
    let w = BrowserWindow.getCurrentWindow();
    w.close();
  }
};


