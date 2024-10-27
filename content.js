(function() {
  if (window.hasRun) {
    console.log("Content script has already run");
    return;
  }
  window.hasRun = true;

  console.log("Content script loaded");

  let circularWindow = null;
  let isDragging = false;
  let offsetX;
  let offsetY;

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

    circularWindow.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
  }

  function dragStart(e) {
    console.log('Drag start', e.clientX, e.clientY);
    const rect = circularWindow.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    if (e.target === circularWindow) {
      isDragging = true;
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      
      // Adjust for scroll position
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      circularWindow.style.left = `${x + scrollX}px`;
      circularWindow.style.top = `${y + scrollY}px`;
    }
  }

  function dragEnd(e) {
    console.log('Drag end');
    isDragging = false;
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