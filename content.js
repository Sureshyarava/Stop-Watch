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

  function createStopwatchWindow() {
    if (stopwatchWindow) {
      console.log('Stopwatch window already exists');
      return;
    }

    stopwatchWindow = document.createElement('div');
    stopwatchWindow.id = 'stopwatch-window';
    stopwatchWindow.className = 'stopwatch-rectangle';
    stopwatchWindow.innerHTML = `
      <div id="drag-handle">&#9776;</div>
      <p id="stopwatch-time">00:00:00</p>
      <div class="button-container">
        <button id="start-stop-button">Start</button>
        <button id="reset-button" disabled>Reset</button>
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
      
      // Adjust for scroll position
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      stopwatchWindow.style.left = `${x + scrollX}px`;
      stopwatchWindow.style.top = `${y + scrollY}px`;
    }
  }

  function dragEnd() {
    isDragging = false;
  }

  function toggleStartStop() {
    const startStopButton = document.getElementById('start-stop-button');
    const resetButton = document.getElementById('reset-button');
    if (isRunning) {
      clearInterval(intervalId);
      startStopButton.textContent = 'Start';
      resetButton.disabled = false;
      isRunning = false;
    } else {
      intervalId = setInterval(updateTime, 1000);
      startStopButton.textContent = 'Stop';
      resetButton.disabled = true;
      isRunning = true;
    }
  }

  function resetStopwatch() {
    if (!isRunning) {
      seconds = 0;
      updateTime();
    }
  }

  function updateTime() {
    document.getElementById('stopwatch-time').textContent = formatTime(seconds);
    seconds++;
  }

  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
      if (!stopwatchWindow) {
        createStopwatchWindow();
      } else {
        stopwatchWindow.remove();
        stopwatchWindow = null;
      }
    }
  });

  console.log('Stopwatch script setup complete');
})();