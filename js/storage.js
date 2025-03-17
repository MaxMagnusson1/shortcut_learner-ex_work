chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "save_shortcut") {
      saveShortcutToStorage(message.shortcut);
      sendResponse({ status: "Shortcut saved!" });
  }
});

// Funktion för att spara kortkommandot i Chrome Storage
function saveShortcutToStorage(shortcut) {
  chrome.storage.local.get(["shortcuts"], function (result) {
      let shortcuts = result.shortcuts || []; // Hämta tidigare sparade kortkommandon

      // Lägg till det nya kortkommandot
      shortcuts.push({ shortcut: shortcut, timestamp: new Date().toISOString() });

      // Spara tillbaka uppdaterad lista i Chrome Storage
      chrome.storage.local.set({ shortcuts: shortcuts }, function () {
          console.log("Kortkommando sparat:", shortcut);
      });
  });
}
