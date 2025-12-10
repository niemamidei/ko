/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const steamworks = require('steamworks.js');

const client = steamworks.init(3083910);

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
});

// TODO: add achievement thing here...
//   // TODO: on achievement, call steam api...
window.onAchieve = function(achievementName) {
  console.log(achievementName);
  if (client.achievement.activate('ACHIEVEMENT')) {
      console.log('steam achievement');
      client.stats.storeStats();
  }
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

window.cloudSave = function(filename, data) {
    if (client.cloud.isEnabledForAccount() && client.cloud.isEnabledForApp()) {
        if (client.cloud.writeFile(filename, data)) {
            console.log('Save successful');
        } else {
            console.log('Save unsuccessful');
        }
    }
};

window.cloudLoad = function(filename) {
    if (client.cloud.isEnabledForAccount() && client.cloud.isEnabledForApp()) {
        if (client.cloud.writeFile(filename, data)) {
            console.log('Save successful');
        } else {
            console.log('Save unsuccessful');
        }
    }
};


/////////// Save/load functions
window.autosave = function() {
  var oldData = localStorage[window.dendryUI.save_prefix+'_a0'];
  if (oldData) {
      localStorage[window.dendryUI.save_prefix+'_a1'] = oldData;
      localStorage[window.dendryUI.save_prefix+'_timestamp_a1'] = localStorage[window.dendryUI.save_prefix+'_timestamp_a0'];
  }
  var slot = 'a0';
  var saveString = JSON.stringify(window.dendryUI.dendryEngine.getExportableState());
  localStorage[window.dendryUI.save_prefix + '_' + slot] = saveString;
  var scene = window.dendryUI.dendryEngine.state.sceneId;
  var date = new Date(Date.now());
  date = scene + '\n(' + date.toLocaleString(undefined, window.dendryUI.DateOptions) + ')';
  localStorage[window.dendryUI.save_prefix +'_timestamp_' + slot] = date;
  window.dendryUI.populateSaveSlots(slot + 1, 2);
};

window.quickSave = function() {
    var saveString = JSON.stringify(window.dendryUI.dendryEngine.getExportableState());
    localStorage[window.dendryUI.save_prefix + '_q'] = saveString;
    window.alert('Saved.');
};

window.saveSlot = function(slot) {
    var saveString = JSON.stringify(window.dendryUI.dendryEngine.getExportableState());
    localStorage[window.dendryUI.save_prefix + '_' + slot] = saveString;
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    var date = new Date(Date.now());
    date = scene + '\n(' + date.toLocaleString(undefined, window.dendryUI.DateOptions) + ')';
    localStorage[window.dendryUI.save_prefix + '_timestamp_' + slot] = date;
    window.dendryUI.populateSaveSlots(slot + 1, 2);
};

window.quickLoad = function() {
    if (localStorage[window.dendryUI.save_prefix + '_q']) {
      var saveString = localStorage[window.dendryUI.save_prefix + '_q'];
      window.dendryUI.dendryEngine.setState(JSON.parse(saveString));
      window.alert('Loaded.');
    } else {
      window.alert('No save available.');
    }
};

window.loadSlot = function(slot) {
    if (localStorage[window.dendryUI.save_prefix + '_' + slot]) {
      var saveString = localStorage[window.dendryUI.save_prefix + '_' + slot];
      window.dendryUI.dendryEngine.setState(JSON.parse(saveString));
      window.dendryUI.hideSaveSlots();
      window.alert('Loaded.');
    } else {
      window.alert('No save available.');
    }
};

window.deleteSlot = function(slot) {
    if (localStorage[window.dendryUI.save_prefix + '_' + slot]) {
      localStorage[window.dendryUI.save_prefix + '_' + slot] = '';
      localStorage[window.dendryUI.save_prefix + '_timestamp_' + slot] = '';
      window.dendryUI.populateSaveSlots(slot + 1, 2);
    } else {
      window.alert('No save available.');
    }
};

window.exportSlot = function(slot) {
    if (localStorage[window.dendryUI.save_prefix + '_' + slot]) {
      var data = localStorage[window.dendryUI.save_prefix + '_' + slot];
      var a = document.createElement("a");
      var file = new Blob([data], {type: 'text/plain'});
      a.href = URL.createObjectURL(file);
      a.download = 'save.txt';
      a.click();
    } else {
      window.alert('No save available.');
    }
};

window.importSave = function(doc_id) {
  function onFileLoad(e) {
      var data = e.target.result;
      window.dendryUI.dendryEngine.setState(JSON.parse(data));
      window.hideSaveSlots();
      window.alert('Loaded.');
  }
  var uploader = document.getElementById(doc_id);
  var reader = new FileReader();
  var file = uploader.files[0];
  console.log(uploader.files);
  reader.onload = onFileLoad;
  reader.readAsText(file);
};

window.populateSaveSlots = function(max_slots, max_auto_slots) {
    // this fills in the save information
    function createLoadListener(i) {
      return function(evt) {
        window.loadSlot(i);
      };
    }

    function createSaveListener(i) {
      return function(evt) {
        window.saveSlot(i);
      };
    }

    function createDeleteListener(i) {
      return function(evt) {
        window.deleteSlot(i);
      };
    }

    function createExportListener(i) {
      return function(evt) {
        window.exportSlot(i);
      };
    }

    function populateSlot(id) {
      var save_element = document.getElementById('save_info_' + id);
      var save_button = document.getElementById('save_button_' + id);
      var delete_button = document.getElementById('delete_button_' + id);
      if (localStorage[window.save_prefix + '_' + id]) {
          var timestamp = localStorage[window.save_prefix+'_timestamp_' + id];
          save_element.textContent = timestamp;
          save_button.textContent = "Load";
          save_button.onclick = createLoadListener(id);
          delete_button.onclick = createDeleteListener(id);
      } else {
          save_button.textContent = "Save";
          save_element.textContent = "Empty";
          save_button.onclick = createSaveListener(id);
      }
      try {
          var export_button = document.getElementById('export_button_' + id);
          if (localStorage[window.save_prefix + '_' + id]) {
              export_button.onclick = createExportListener(id);
          }
      } catch(error) {
      }

  }
  for (var i = 0; i < max_slots; i++) {
      populateSlot(i);
  }
  for (i = 0; i < max_auto_slots; i++) {
      populateSlot('a'+i);
  }

};

window.showSaveSlots = function() {
    if (window.dendryUI.dendryEngine.state.disableSaves) {
        window.alert('Saving and loading is currently disabled.');
        return;
    }
    var save_element = document.getElementById('save');
    save_element.style.display = 'block';
    window.dendryUI.populateSaveSlots(window.dendryUI.max_slots, 2);
    if (!save_element.onclick) {
      save_element.onclick = function(evt) {
        var target = evt.target;
        var save_element = document.getElementById('save');
        if (target == save_element) {
          window.hideSaveSlots();
        }
      };
    }
};

window.hideSaveSlots = function() {
    var save_element = document.getElementById('save');
    save_element.style.display = 'none';
};
