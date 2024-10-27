(function() {
    if (window.hasRun) {
      console.log("Content script has already run");
      return;
    }
    window.hasRun = true;
  
    console.log("Content script loaded");
  
    let circularWindow = null;
  
    function createCircularWindow() {
      console.log("Creating circular window");
      if (circularWindow) {
        console.log("Circular window already exists");
        return;
      }
  
      circularWindow = document.createElement('div');
      circularWindow.id = 'suresh-stop-watch-window';
      circularWindow.className = 'circular-window';
      circularWindow.innerHTML = '<span>Suresh</span>';
      document.body.appendChild(circularWindow);
      console.log("Circular window appended to body", circularWindow);
  
      // ... (rest of the dragging functionality)
    }
  
    function toggleCircularWindow() {
      console.log("Toggling circular window");
      if (circularWindow) {
        console.log("Removing existing circular window");
        circularWindow.remove();
        circularWindow = null;
      } else {
        console.log("Creating new circular window");
        createCircularWindow();
      }
      console.log("Circular window state:", circularWindow ? "visible" : "hidden");
    }
  
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("Message received in content script:", request);
      if (request.action === "toggle") {
        toggleCircularWindow();
        console.log("Toggle action performed");
        sendResponse({status: "Toggle action performed"});
      }
      return true;
    });
  
    console.log("Content script setup complete");
  })();