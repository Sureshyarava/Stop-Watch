chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked for tab:", tab.id);
  
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("https://www.google.com/search*")) {
      console.log("Cannot inject scripts into chrome:// or chrome-extension:// pages");
      return;
    }
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Script injection failed:", chrome.runtime.lastError.message);
      } else {
        console.log("Content script injected successfully");
        chrome.tabs.sendMessage(tab.id, { action: "toggle" })
          .then(response => {
            console.log("Toggle message sent, response:", response);
          })
          .catch(error => {
            console.error("Error sending toggle message:", error);
          });
      }
    });
  });
  
  console.log("Background script loaded");