// content.js
(function() {
  if (window.hasRun) {
    console.log('Content script has already run');
    return;
  }
  window.hasRun = true;

  console.log('Content script loaded');

  let stopwatchWindow = null;
  let seconds = 0;
  let isRunning = false;
  let intervalId;
  let isDragging = false;
  let offsetX, offsetY;
  const tabId = window.location.href; // Use URL as unique identifier for this tab

  function createStopwatchWindow() {
    if (stopwatchWindow) {
      console.log('Stopwatch window already exists');
      return;
    }

    stopwatchWindow = document.createElement('div');
    stopwatchWindow.id = 'stopwatch-window';
    stopwatchWindow.className = 'stopwatch-rectangle';
    stopwatchWindow.style.display = 'none'; // Initially hidden
    stopwatchWindow.innerHTML = `
      <div id="drag-handle">
        <p id="stopwatch-time">00:00:00</p>
        <div class="button-container">
        <button id="start-stop-button">Start</button>
        <button id="reset-button">Reset</button>
        </div>
      </div>
    `;
    document.body.appendChild(stopwatchWindow);

    document.getElementById('start-stop-button').addEventListener('click', toggleStartStop);
    document.getElementById('reset-button').addEventListener('click', resetStopwatch);

    // Add drag functionality
    const dragHandle = document.getElementById('drag-handle');
    dragHandle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Set initial position if not restored
    if (!stopwatchWindow.style.left && !stopwatchWindow.style.top) {
      stopwatchWindow.style.left = '20px';
      stopwatchWindow.style.top = '20px';
    }

    // Restore state after creating the window
    restoreStopwatchState();
  }

  function restoreStopwatchState() {
    chrome.storage.local.get([`${tabId}_seconds`, `${tabId}_isRunning`, `${tabId}_position`, `${tabId}_visible`], (result) => {
      seconds = result[`${tabId}_seconds`] || 0;
      isRunning = result[`${tabId}_isRunning`] || false;
      const position = result[`${tabId}_position`];
      const visible = result[`${tabId}_visible`];
      
      if (position) {
        stopwatchWindow.style.left = position.left;
        stopwatchWindow.style.top = position.top;
      }

      // Explicitly set the display property based on the saved state
      stopwatchWindow.style.display = visible ? 'block' : 'none';

      updateTime();

      if (isRunning) {
        intervalId = setInterval(updateTime, 1000);
        document.getElementById('start-stop-button').textContent = 'Stop';
      } else {
        document.getElementById('start-stop-button').textContent = 'Start';
      }
    });
  }

  function dragStart(e) {
    isDragging = true;
    const rect = stopwatchWindow.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      
      stopwatchWindow.style.left = `${x}px`;
      stopwatchWindow.style.top = `${y}px`;

      // Save position
      saveState();
    }
  }

  function dragEnd() {
    isDragging = false;
  }

  function toggleStartStop() {
    const startStopButton = document.getElementById('start-stop-button');
    if (isRunning) {
      clearInterval(intervalId);
      startStopButton.textContent = 'Start';
      isRunning = false;
    } else {
      isRunning = true;
      startStopButton.textContent = 'Stop';
      // Immediately update the time once before setting the interval
      updateTime();
      intervalId = setInterval(updateTime, 1000);
    }
    saveState();
  }

  function resetStopwatch() {
    clearInterval(intervalId);
    seconds = 0;
    isRunning = false;
    document.getElementById('start-stop-button').textContent = 'Start';
    updateTime();
    saveState();
  }

  function updateTime() {
    if (isRunning) {
      seconds++;
    }
    document.getElementById('stopwatch-time').textContent = formatTime(seconds);
    saveState();
  }

  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function saveState() {
    chrome.storage.local.set({
      [`${tabId}_seconds`]: seconds,
      [`${tabId}_isRunning`]: isRunning,
      [`${tabId}_position`]: {
        left: stopwatchWindow.style.left,
        top: stopwatchWindow.style.top
      },
      [`${tabId}_visible`]: stopwatchWindow.style.display === 'block'
    });
  }

  function toggleStopwatch() {
    if (!stopwatchWindow) {
      createStopwatchWindow();
    }
    
    stopwatchWindow.style.display = (stopwatchWindow.style.display === 'none') ? 'block' : 'none';
    saveState();
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
      toggleStopwatch();
      sendResponse({status: "Stopwatch toggled"});
    }
    return true; // Indicates that the response is sent asynchronously
  });

  // Save state when tab is closed or refreshed
  window.addEventListener('beforeunload', saveState);

  // Create stopwatch window immediately when the script runs, but keep it hidden
  createStopwatchWindow();

  console.log('Stopwatch script setup complete');
})();
