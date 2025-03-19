let flagForWebbsiteForAlt = false;
let flagForWebbsiteForCTRLR = false; 
/**
 * Lyssnar på när en ny flik skapas och omdirigerar till Google OCH skriver ut CTRL + T
 */
const tabsToRedirect = new Set(); 

chrome.tabs.onCreated.addListener((tab) => {

    flagForWebbsiteForCTRLR = false;

    // Om det är en ny tom flik (chrome://newtab), markera den för eventuell omdirigering
    if (!tab.url || tab.url.startsWith("chrome://newtab")) {
        tabsToRedirect.add(tab.id);
    }
});

// Lyssna på när en flik uppdateras (URL ändras eller laddas klart) och fiall det är en ny flik som ska omdirigeras till google.com
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabsToRedirect.has(tabId)) {
        if (changeInfo.url && !changeInfo.url.startsWith("chrome://newtab")) {
            // Om fliken går till en RIKTIG webbsida, ta bort den från listan
            tabsToRedirect.delete(tabId);
        } else if (changeInfo.status === "complete" && (!tab.url || tab.url.startsWith("chrome://newtab"))) {
            // Om fliken fortfarande är "chrome://newtab/" efter att den har laddats klart → omdirigera till Google
            chrome.tabs.update(tabId, { url: "https://www.google.com" });

            // När Google laddas klart, visa "CTRL + T"
            chrome.tabs.onUpdated.addListener(function listener(updatedTabId, updatedChangeInfo, updatedTab) {
                if (updatedTabId === tabId && updatedChangeInfo.status === "complete" && updatedTab.url.includes("https://www.google.com")) {
          
                    // Ta bort event listenern för att undvika att det körs flera gånger
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });

            tabsToRedirect.delete(tabId); // Ta bort fliken från listan efter omdirigering
        }
    }
});

/**
 * Lyssnar på front end ifall ctrl r eller alt arrow har tryckts och sätter flaggor till true isåfal. 
 */

let ctrlRPressed = false;
let altArrowPressed = false;
let CctrlRPressed = false;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ctrl_r_pressed') {
        ctrlRPressed = true;
    }
    if (message.action === 'alt_arrow_pressed') {
        altArrowPressed = true;
    }
});

/**
 * Variabler för att hålla koll på url:er 
 */
let previousUrls = {};
let tabHistory = {};
let lastLoadTime = {}; 

/**
 * Kontrollerar vilken typ av uppdatering som har skett, om det är en länk, form submit eller manual subframe sätts ctrlRPressed till true 
 * och prompten kommer inte att skrivas ut 
 */
chrome.webNavigation.onCommitted.addListener((details) => {

    if (details.transitionType === "link"||  details.transitionType === "form_submit" || details.transitionType === "manual_subframe") {
        ctrlRPressed = true;
    } 
});


/**
 * Kontrollerar ifall alt prompten är synlig, får en ping från frontend, sätter flaggan till true eller false, ctrl r kommer isåfall
 * inte att skrivas ut 
 */
let altPromptsVisable = false;  
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'alt_prompts_visable') {
        altPromptsVisable = true;
        
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'alt_prompts_not_visable') {
        altPromptsVisable = false;
    }
});



let isAlreadyPrompted = false; // Kontrollerar om meddelandet redan har visats
// Lyssna på flikuppdateringar
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    //körs endast närfliken är klar laddad 
    if (changeInfo.status === "complete" && !isAlreadyPrompted) {
        isAlreadyPrompted = true;
        if (!tabHistory[tabId]) {
            tabHistory[tabId] = [];
        }

        // Hämta historik för just denna fli
        let history = tabHistory[tabId];
        let currentUrl = new URL(tab.url).href; // Fullständig URL jämförelse

            if ((history.length > 0 && new URL(history[history.length - 1]).href === currentUrl)) {
             

                if(!ctrlRPressed && !altPromptsVisable){
               
                        chrome.tabs.sendMessage(tabId, {
                        action: "show_message",
                        text: "CTRL + R"
                    }, () => {
                        if (chrome.runtime.lastError) {}
                    });
                    return; 
                        } else {  
                            ctrlRPressed = false;
                            // console.log("mega");
                            return; 
                        }
                    }

        // Om den nya URL:en är samma som den senaste, betyder det att sidan laddades om (CTRL + R)
      
        // Uppdatera historiken för fliken
        history.push(tab.url);

        // Begränsa historiken till de senaste 10 URL:erna för att spara minne
        if (history.length > 10) {
            history.shift();
        }
    }

    setTimeout(() => {
        isAlreadyPrompted = false;    
    } , 1000);
});

// Ta bort flikens historik när fliken stängs
chrome.tabs.onRemoved.addListener((tabId) => {
    delete tabHistory[tabId];
});


// Lyssna på när användaren byter flik och uppdatera URL:en
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            previousUrls[activeInfo.tabId] = tab.url;
        }
    });
});


// Spara den aktuella aktiva fliken
let activeTabId = null;

// Uppdatera aktiv flik när användaren byter flik
chrome.tabs.onActivated.addListener((activeInfo) => {
    activeTabId = activeInfo.tabId;
});

/**
 * Lyssna efter att användaren bokmärker en sida via kortkommando, tar emot message från content script
 */

let ctrlDPressed = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ctrl_d_pressed') {
        ctrlDPressed = true;
    }
});

/**
 * Kontroll ifall content script har skickat ping att användaren har bokmärk något, kontrollerar ctrlDPressed flaggan.
 */


chrome.bookmarks.onCreated.addListener((id, bookmark) => {

    if (!ctrlDPressed) {
    chrome.tabs.sendMessage(activeTabId, {
        action: "show_message",
        text: "CTRL + D"
    }, () => {
        if (chrome.runtime.lastError) {
        }
    });
} else {
    ctrlDPressed = false;
}
});
  

/**
 * Kontrollerar ifall content script har skickat ett meddelande om användaren har använt ctrl s kortkommando.
 */
let ctrlSPressed = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ctrl_s_pressed') {
        ctrlSPressed = true;
    }
}
);

/**
 * Funtion som lyssnar på frontend ifall ctrl + s har aktiverats. Kontrolelrar ifall flaggan är false. SKickar det till content script 
 */

chrome.downloads.onCreated.addListener((downloadItem) => {
    if (!ctrlSPressed) {
        chrome.tabs.sendMessage(activeTabId, {
            action: "show_message",
            text: "CTRL + S"
        }, () => {
            if (chrome.runtime.lastError) {
            }
        });
    } else {
        ctrlSPressed = false; 
     }
    }
);


/**
 * Lyssnar efter om användaren söker eller navigerar till en webbplats. Om dnen hamnar på new tab så omrediergerar vi den till google.com
 */
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        const url = new URL(changeInfo.url);

        if ((url.hostname.includes("google.com") && url.pathname.includes("/search")) ||
            (url.hostname.includes("bing.com") && url.pathname.includes("/search")) ||
            (url.hostname.includes("duckduckgo.com") && url.pathname.includes("/")) ||
            (url.hostname.includes("yahoo.com") && url.pathname.includes("/search"))) {
            
        } else {
            flagForWebbsiteForCTRLR = true;
            flagForWebbsiteForAlt = true;
        }
      }
    }
);


/*
* Sparar gui kommands lokalt tillsammans med en hashad url där de används 
*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "save_action_for_GUI") {
        saveShortcutToStorage(message.shortcut, "gui_actions", message.hasedUrl); 
        sendResponse({ status: "GUI action saved!" });
    } else {
        sendResponse({ status: "Shortcut not saved!" });
    }
    return true; // Låter Chrome vänta på asynkron lagring
});

/**
 * Lyssnar på kortkommandon och lagrar det lokalt tillsammans med en hashad url där de används
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "save_shortcut_from_keyboard") {

        saveShortcutToStorage(message.shortcut, "keyboard_shortcuts", message.hasedUrl);
        sendResponse({ status: "Keyboard shortcut saved!" });
    }
    else {
        sendResponse({ status: "Shortcut not saved!" });    
    }
    return true; // Låter Chrome vänta på asynkron lagring
    }
);

// Funktion för att spara kortkommandon med en separat nyckel beroende på typ (GUI eller tangentbord)
function saveShortcutToStorage(shortcut, storageKey, hasedUrl) {
    if (!shortcut) {
        return;
    }

    chrome.storage.local.get([storageKey], function (result) {
        if (chrome.runtime.lastError) {
            return;
        }

        let shortcuts = result[storageKey] || {}; // Hämta rätt lagringsnyckel

        if(!shortcuts[hasedUrl]){
            shortcuts[hasedUrl] = {};
        }
        // Öka räknaren för kortkommandot
        shortcuts[hasedUrl][shortcut] = (shortcuts[hasedUrl][shortcut] || 0) + 1;

        // Spara tillbaka uppdaterad data
        chrome.storage.local.set({ [storageKey]: shortcuts }, function () {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
        });
        }
    );
}


/**
 * Funtioner för att hämta data lokalt, bearbeta datan, sätta in den i serven, ta bort den lokala datan.
 */ 


// Funktion för att hämta gui_actions och keyboard_shortcuts från Chrome Storage och returnera som JSON
function fetchStoredDataAsJson() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['gui_actions', 'keyboard_shortcuts', 'id'], function (result) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
                return;
            }

            const guiActions = result.gui_actions || {};
            const keyboardShortcuts = result.keyboard_shortcuts || {};
            const userId = result.id || {};

            const data = {
                gui_actions: guiActions,
                keyboard_shortcuts: keyboardShortcuts,
                id: userId
            };
            
            if (result.id){
                const isEmpty = Object.keys(guiActions).length === 0 && Object.keys(keyboardShortcuts).length === 0 && Object.keys(result.id).length === 0;
                resolve({ data, isEmpty });
            }

        });
    });
}

/**
 * Funktion för att skicka data till servern, skickar den lokala datan som json
 */

function sendDataToServer(data) {
    fetch('https://melab.lnu.se/~mm224zp/shortcut_learner/database.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)     
    })
    .then(response => {
        // Konvertera JSON-svaret
        return response.json().then(result => ({ result }));
    })
    .then(({ result }) => {
        // Skicka en ping till frontend beroende på status, ifall det är sucsess är insättingen lyckad och datan som sattes in tas bort lokalt  
        if (result.status === "success") {
            
            removeLocalData(data);
        } 
    })
    .catch(error => console.error('Fetch error:', error));

}


function removeLocalData(sentData) {
    chrome.storage.local.get(['gui_actions', 'keyboard_shortcuts'], function (result) {
        if (chrome.runtime.lastError) {
            return;
        }

        let currentGuiActions = result.gui_actions || {};
        let currentKeyboardShortcuts = result.keyboard_shortcuts || {};

        // Skapa en ny version av datan där vi tar bort endast den skickade datan
        Object.keys(sentData.gui_actions).forEach(key => {
            if (currentGuiActions[key] !== undefined) {
                currentGuiActions[key] -= sentData.gui_actions[key]; // Minska räkningen
                if (currentGuiActions[key] <= 0) delete currentGuiActions[key]; // Ta bort om 0
            }
        });

        Object.keys(sentData.keyboard_shortcuts).forEach(key => {
            if (currentKeyboardShortcuts[key] !== undefined) {
                currentKeyboardShortcuts[key] -= sentData.keyboard_shortcuts[key]; // Minska räkningen
                if (currentKeyboardShortcuts[key] <= 0) delete currentKeyboardShortcuts[key]; // Ta bort om 0
            }
        });

        // Uppdatera Chrome Storage med den kvarvarande datan
        chrome.storage.local.set({
            gui_actions: currentGuiActions,
            keyboard_shortcuts: currentKeyboardShortcuts
        }, function () {
            if (chrome.runtime.lastError) {
            } else {
            }
        });
    });
}


// Funktion för att logga data som JSON och skicka till servern om det inte är tomt
function logAndSendStoredData() {
    fetchStoredDataAsJson().then(result => {
        if (!result.isEmpty) {
            sendDataToServer(result.data);
        } else {
        }
    }).catch(error => {
        console.error("Fel vid hämtning av data:", error);
    });
}

/**
 * Data försöker sparas i servern direkt vid uppstart samt var 20 sekund
 */
setInterval(() => {
    fetchStoredDataAsJson().then(result => {
        if (!result.isEmpty) {
            logAndSendStoredData();
        } else {
        }
    });
}, 20000); 
 logAndSendStoredData();

  // Dateobj för start- och sluttid för att visa knappen samt prompts
let startTime = new Date("2025-03-11T08:00:00").getTime();
let endTime = new Date("2065-03-12T12:00:00").getTime();

function checkTime() {

    let now = new Date().getTime();
    let isVisible = now >= startTime && now <= endTime;
    chrome.storage.local.set({ isPromptsVisible: isVisible });
}

// Kontrollera tiden direkt vid start och sedan varje sekund
checkTime();
setInterval(checkTime, 1000);
/** 

 * 
 * 
 * Dessa kommer kunna mätas utan problem med säkerhet 
 * CTRL + R:
 * CTRL + S:
 * CTRL + D:
 * CTRL + P:
 * CTRL + C:
 * CTRL + V :
 * CTRL + X:
 * Markeing av ord :
 * 
 * Dessa kommer kunna mätas med keyboard shortcuts men inte via GUI
 * CTRL + F:
 * CTRL + Z
 * CTRL + Y
 * CTRL + A
 * CTRL + +
 * CTRL + -
 * CTRL + 0
 * CTRL + L
 * CTRL + shift i
 * 
 * 
 * 
 * 
 *vad behöver fortsätta att kolals på
*
* om insättningarna i databasen stämmer som det ska 

UNDER TESTNING: 
 */

//shortcut för dubbelklick loggas inte
