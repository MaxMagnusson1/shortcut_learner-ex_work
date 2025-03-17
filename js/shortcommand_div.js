class ShortcommandDiv {

  /**
   * Konstruktor som tar emot operativsystemet som argument
   * Kallar på funktioner
   */
  constructor(os) {
    this.platformCommand = os;
    this.div = null;
    this.promptingAltArrow = false;
    this.devToolsOpen = false; 
    this.firstRun = true; 
    this.setupEventListeners();
    this.setupMessageListener();
    this.setupCopyListener(); 
    this.setupPasteListener(); 
    this.setupCutListener();
    this.divContainer = null; 
    this.isPromptVisible = false; 
    this.isCtrlShiftPressed = false;
    this.ctrlAltEvent();
    this.setupPopStateListener();
    this.overrideHistoryMethods();
    this.mouseY;

    document.addEventListener("DOMContentLoaded", () => {
      this.createDivContainer(); // Skapa container efter att DOM är redo
      this.setupSelectAllListener();
      this.setupEventListenersForShortcuts();
      
    }
   );   

   window.addEventListener("mousemove", (event) => {
    this.mouseY = event.clientY;
});

  window.addEventListener("popstate", (event) => {console.log("popstate")}); 

  }

  
  createDivContainer() {
    if (!this.divContainer) {
      this.divContainer = document.createElement("div");
      this.divContainer.id = "shortcommandDivContainer";
      this.divContainer.classList.add("move-up");
      document.body.appendChild(this.divContainer);
      this.makePromptsClickble();

    }
  }

  makePromptsClickble() {
      if (this.divContainer) {
        this.divContainer.addEventListener("click", () => {
        window.open("https://shortcutsbyshortcutlearner.netlify.app/shortcut.html", "_blank", "noopener,noreferrer");
          }
        ); 
     };
  }
  /**
   * Sätter text i div elementet och gör det synligt
   */

setTextInDiv(text) {
  const newDiv = document.createElement("div");
  newDiv.className = "shortcommandDiv";
  newDiv.classList.add("move-up");
  newDiv.textContent = text;
 
  // Lägg till den nya div:en i containern
  this.divContainer.appendChild(newDiv);

  // Ta bort div:en efter 5 sekunder
  setTimeout(() => {
    newDiv.style.opacity = "0"; 
    setTimeout(() => {
      newDiv.remove(); 
    }, 500); 
  }, 5000);

  setTimeout(() => {
    if(this.promptingAltArrow){
      this.promptingAltArrow = false
      chrome.runtime.sendMessage({
        action: 'alt_prompts_not_visable'
    });
    }
  }, 2000);
}

  /**
   * Gömmer elementet efter 5 sekunder
   */
  hideDiv() {
    setTimeout(() => {
      this.div.style.visibility = "hidden";
    }, 5000);
  }

  /**
   * Lyssnar efter ifall någon markerar text på sidan
   */

  setupSelectAllListener() {
    let timeoutId = null;
    let lastClickTime = 0;
    let clickCount = 0;
    let isCtrlAPressed = false;

    document.addEventListener("mousedown", (event) => {
        const now = Date.now();
        
        if (now - lastClickTime < 400) {
            clickCount++; 
        } else {
            clickCount = 1; 
        }
        
        lastClickTime = now;
    });

    document.addEventListener("keydown", (event) => {
      if(event.ctrlKey && event.key.toLowerCase() === "a") {
        isCtrlAPressed = true;

        setTimeout(() => {
          isCtrlAPressed = false;
       }, 350);
      }
    }); 

  
    /**
     * Eventlyssnare för om det är en dubbelklick eller trippelklick eller om texten är markerad genom att dra, kollar om det är mer än 1 ord som är markerat
     */
    document.addEventListener("selectionchange", () => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
          let message = "";

          if(!isCtrlAPressed){

            if (!this.isPromptVisible) {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const selectedText = selection.toString().trim();
                if (selectedText.length === 0) return; 

                if (clickCount == 2) {
                    message = "Shortcut: Dubbelklick"
                    this.sendToStorageForKeyboard(message);
                    return; 
                }
                else if (clickCount >= 3) {
                    message = "Shortcut: Trippelklick";
                    this.sendToStorageForKeyboard(message);
                    return;
                }


                if (selectedText.split(" ").length === 1) {
                    message = "Dubbelklicka för ett ord.";
                } else {
                    message = "Trippelklicka för en paragraf.";
                }

                this.isPromptVisible = true;
                this.sendToStorage(message);
                this.controlIfToPromt(message);
            }
        }
        }, 300);
    }
  );
}

  /**
   * Controllerar ifall någon är påväg ut att skriva ut något 
   */
  setupEventListeners() {
    window.addEventListener("beforeprint", () => {

      if (!this.isCtrlPPressed){
        let shortcommand = this.platformCommand + " + P - Skriv ut";
        let shortcommandForJson = "CTRL/CMD + P";
        this.controlIfToPromt(shortcommand);
        this.sendToStorage(shortcommandForJson);
      }
      else {
        this.isCtrlPPressed = false
      }
    }
  );
  }

/**
 * Lyssnar efter ifall någon kopierar text från en sida
 */
  setupCopyListener() {
    document.addEventListener("copy", (event) => {

      if(!this.isCtrlCPressed){
          this.shortcommandForJson = "CTRL/CMD + C";
          this.controlIfToPromt(`${this.platformCommand} + C - Kopiera`);
          this.sendToStorage(this.shortcommandForJson);
      }
      else {
        this.isCtrlCPressed = false;
      }
     }
   );
  }

  /**
   * Lyssnar efter ifall någon klistrar in text på en sida
   */
  setupPasteListener() {
    document.addEventListener("paste", (event) => {

      if(!this.isCtrlVPressed){
        this.shortcommandForJson = "CTRL/CMD + V";
      this.controlIfToPromt(`${this.platformCommand} + V - Klistra in`);
      this.sendToStorage(this.shortcommandForJson);
      }
       else {
        this.isCtrlVPressed = false;
       }
     }
   );
  } 

  /**
   * Eventlyssnare för om någon cuttar något från textinmatning inte adressfältet dock
   */

  setupCutListener() {
    document.addEventListener("cut", (event) => {
        if (!this.isCtrlXPressed) {
            this.shortcommandForJson = "CTRL/CMD + X";
            this.controlIfToPromt(`${this.platformCommand} + X - Klipp ut`);
            this.sendToStorage(this.shortcommandForJson);
        } else {
            this.isCtrlXPressed = false;
        }
    });
}

/**
 * Switch case som hanterar olika meddelanden som skickas från background.js
 */

setupPopStateListener() {
  window.addEventListener('popstate', (event) => {
    const currentUrl = window.location.href;
    this.handleUrlChange(currentUrl);
  });
}

/**
 * Override history methods to detect URL changes
 */
overrideHistoryMethods() {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  const handleUrlChange = this.handleUrlChange.bind(this);

  history.pushState = function (state, title, url) {
    originalPushState.apply(history, arguments);
    handleUrlChange();
  };
history.replaceState = function (state, title, url) {
  originalReplaceState.apply(history, arguments);
  handleUrlChange();
};
}

/**
* Hanterar URL-ändringar
*/

handleUrlChange() {
  let shortcommand = "";
  let shortcommandForJson = "";
console.log("HEJ");
  if (!this.altArrowPressed) {
    this.promptingAltArrow=true;
    chrome.runtime.sendMessage({
      action: 'alt_prompts_visable'
  });
    if (this.mouseY<=5 || !this.mouseY){
    if (this.platformCommand === "CTRL") {
      shortcommand = "ALT + ← / ALT + → - Bakåt/framåt";
      shortcommandForJson = "ALT + ← / ALT + →";
    } else if (this.platformCommand === "CMD") {
      shortcommand = "CMD + ← / CMD + → - Bakåt/framåt";
      shortcommandForJson = "ALT + ← / ALT + →";
    } else {
      shortcommand = "CTRL/CMD + ← / CTRL/CMD + → - Bakåt/framåt";
      shortcommandForJson = "ALT + ← / ALT + →";
    }
     
    this.controlIfToPromt(shortcommand);
    this.sendToStorage(shortcommandForJson);
  } 
}
  else {
    this.altArrowPressed = false;
  
  }
}

// ...existing code...

ctrlAltEvent() {
let shortcommand = "";
let shortcommandForJson = "";

window.addEventListener("pageshow", (event) => {
  
console.log(event); 
  if (event.persisted && !this.altArrowPressed) {
    chrome.runtime.sendMessage({
      action: 'alt_prompts_visable'
  })
    this.promptingAltArrow=true;
    if (this.mouseY<=5 || !this.mouseY){

    if (this.platformCommand === "CTRL") {
      shortcommand = "ALT + ← / ALT + → - Bakåt/framåt";
      shortcommandForJson = "ALT + ← / ALT + →";
    } else if (this.platformCommand === "CMD") {
      shortcommand = "CMD + ← / CMD + →";
      shortcommandForJson = "ALT + ← / ALT + → - Bakåt/framåt";
    } else {
      shortcommand = "CTRL/CMD + ← / CTRL/CMD + → - Bakåt/framåt";
      shortcommandForJson = "ALT + ← / ALT + →";
    }
    this.controlIfToPromt(shortcommand);
    this.sendToStorage(shortcommandForJson);
  }
;
  } else {
    this.altArrowPressed = false;
  }
});
}



  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "show_message") {
          let shortcommand = "";
          let shortcommandForJson = "";
        
          switch (message.text) {
     
            case "CTRL + R":
              shortcommand = `${this.platformCommand} + R - Ladda om`;
              shortcommandForJson = "CTRL/CMD + R";
              break;

            case "ALT + ← / ALT + →":
              if (this.platformCommand==="CMD"){
                shortcommand = "CMD + ← / CMD + → - Bakåt/framåt"; 
              }
              else if (this.platformCommand==="CTRL"){
                  shortcommand = "ALT + ← / ALT + → - Bakåt/framåt"; 
              }

              else {
                shortcommand = "CTRL/CMD + ← / CTRL/CMD + →- Bakåt/framåt";
              }
              shortcommandForJson = "ALT + ← / ALT + →";
              break;

            case "CTRL + D":
              this.isCtrlDPressed = true;
              shortcommand = `${this.platformCommand} + D - Bokmärke`;
              shortcommandForJson = "CTRL/CMD + D";
              break;

            case "CTRL + S":
              shortcommand = `${this.platformCommand} + S - Spara`;
              shortcommandForJson = "CTRL/CMD + S";
              break;
            default:
              return;
          }
            this.controlIfToPromt(shortcommand);        
            this.sendToStorage(shortcommandForJson);

      }
    });
  }

  /**
   * Funktion för att lyssna efter kortkommandon från tangentbordet, använder keydown, lyssnar efter ctrl och sen matchar det med en annan tangent 
   */
  setupEventListenersForShortcuts() {
    let keysPressed = {}; 

    document.addEventListener("keydown", (event) => {
        keysPressed[event.key] = true;
        let isMac = this.platformCommand === "CMD";
        let ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey; 
        let shortcommandForJson = "";

        // Hantera vanliga Ctrl/Cmd-kortkommandon (utan Shift)
        if (ctrlOrCmd && !event.shiftKey) {
      
            switch (event.key.toLowerCase()) {

                case "r":
                    shortcommandForJson = "Shortcut: CTRL/CMD + R"; //funkar
                    chrome.runtime.sendMessage({
                      action: 'ctrl_r_pressed'
                  });
                    break;
                case "s":
                    shortcommandForJson = "Shortcut: CTRL/CMD + S";//funkar
                    chrome.runtime.sendMessage({
                      action: 'ctrl_s_pressed'
                  });
                    break;
                case "d":
                    shortcommandForJson = "Shortcut: CTRL/CMD + D";//funkar 
                    chrome.runtime.sendMessage({
                      action: 'ctrl_d_pressed'
                  });
                    this.isCtrlDPressed = true;
                    break;
                case "p":
                    shortcommandForJson = "Shortcut: CTRL/CMD + P";//funkar
                    this.isCtrlPPressed = true;
                    break;
            
                case "c":
                    shortcommandForJson = "Shortcut: CTRL/CMD + C";//funkar
                    this.isCtrlCPressed = true;
                    break;
                case "v":
                    shortcommandForJson = "Shortcut: CTRL/CMD + V";//funkar 
                    this.isCtrlVPressed = true;
                    break;

                case "x":
                    shortcommandForJson = "Shortcut: CTRL/CMD + X";//funkar
                    this.isCtrlXPressed = true;
                    break;

                /**
                 * nya kortkommandon som inte mäts via gui
                 */
               
                case "f":
                    shortcommandForJson = "Shortcut: CTRL/CMD + F";//funkar
                    break;
                case "z":
        
                    shortcommandForJson = "Shortcut: CTRL/CMD + Z";//funkar
                    break;
                case "y":
                    shortcommandForJson = "Shortcut: CTRL/CMD + Y";//funkar
                    break;
                case "a":
                    shortcommandForJson = "Shortcut: CTRL/CMD + A";//funkar
                    break;
                case "+":
                    shortcommandForJson = "Shortcut: CTRL/CMD + +";//funkar
                    break;
                case "-":
                    shortcommandForJson = "Shortcut: CTRL/CMD + -";//funkar
                    break;
                case "0":
                    shortcommandForJson = "Shortcut: CTRL/CMD + 0";//funkar
                    break;
                case "l":
                    shortcommandForJson = "Shortcut: CTRL/CMD + L";//funkar

                  
                  
                    break;
            }
        }

        if (event.altKey || event.metaKey){
          switch (event.key.toLowerCase()) {
            case "arrowleft":
                shortcommandForJson = "Shortcut: ALT + ←"; //funkar
                this.altArrowPressed = true;
                break;

            case "arrowright":
                shortcommandForJson = "Shortcut: ALT + →";//funkar
                this.altArrowPressed = true;
                break;
          }
        }

       

        if (ctrlOrCmd && event.shiftKey && event.key.toLowerCase() === "i") {
          this.isCtrlShiftPressed = true; // Sätt flaggan
          shortcommandForJson = "Shortcut: CTRL/CMD + SHIFT + I"; //funkar
      }      

        // Skicka data om ett kortkommando upptäcktes
        if (shortcommandForJson) {
            this.sendToStorageForKeyboard(shortcommandForJson);
        }
    });

    // Ta bort tangenter från `keysPressed` när de släpps
    document.addEventListener("keyup", (event) => {
        delete keysPressed[event.key];
    });
}

/**
 * Funktion som kontrollerar ifall en prompt ska visas eller inte, kollar en boolean i chrome storage
 */
controlIfToPromt(text) {

  chrome.storage.local.get("isPromptsVisible", (data) => {
    if (data.isPromptsVisible) {
          this.remindUserOnceAday();
          this.createDivContainer();
          this.setTextInDiv(text)    
    } 
  })
}

// Skickar GUI data till background.js
  sendToStorage(shortcommandForJson) {
    // Get the current URL

// You can also use other properties of window.location
  const hostname = window.location.hostname;
  var hashedUrlString = window.btoa(hostname); // Encode the hostname to base64

     chrome.runtime.sendMessage({
      action: "save_action_for_GUI",
      shortcut: shortcommandForJson, 
      hasedUrl: hashedUrlString
    }, function(response) {
    });
  }

//skickar keyboardshortdata till background.js
  sendToStorageForKeyboard(shortcommandForJson) {
    const hostname = window.location.hostname;
    var hashedUrlString = window.btoa(hostname); // Encode the hostname to base64

     chrome.runtime.sendMessage({
      action: "save_shortcut_from_keyboard",
      shortcut: shortcommandForJson,
      hasedUrl: hashedUrlString

    }, function(response) {
    });
  }

  remindUserOnceAday(text) {
    const today = new Date().toISOString().split('T')[0]; // Få dagens datum i formatet YYYY-MM-DD
    chrome.storage.local.get("lastPromptDate", (data) => {
      const lastPromptDate = data.lastPromptDate;
      var textString = "Under denna period får du kortkommando prompts. <br>Utforska fler kortkommandon i tillägget eller klicka på en prompt!";
      if (lastPromptDate !== today) {
        // Om ingen prompt har visats idag, visa prompten och uppdatera lastPromptDate
        this.createDivContainer();
        this.setTextInReminderPrompts(textString);
        chrome.storage.local.set({ lastPromptDate: today });
      }
    });
  }

  setTextInReminderPrompts(text) {
    const newReminderDiv = document.createElement("div");
    newReminderDiv.innerHTML = text;
    newReminderDiv.id="reminderPrompt";

    // Lägg till den nya div:en i containern
    this.divContainer.appendChild(newReminderDiv);

    // Ta bort div:en efter 15 sekunder
    setTimeout(() => {
      newReminderDiv.style.opacity = "0";
      setTimeout(() => {
        newReminderDiv.remove();
      }, 5000);
    }, 15000);
  }
}



window.ShortcommandDiv = ShortcommandDiv;
