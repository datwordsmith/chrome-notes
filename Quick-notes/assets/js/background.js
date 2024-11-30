chrome.action.onClicked.addListener(async (tab) => {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: "toggle_sidebar" });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closePopup') {
      window.close();
    }
  });