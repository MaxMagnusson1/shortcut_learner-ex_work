class ShortCommandNotifier {
    /**
     * Contructor för shortcommandnotifier klassen, sätter två variaber, gör kallar  detectOS för att kontrollera OS, kallar på klass för att skapa 
     * Div:et som ska visas samt kallar på funktionen checkAndSaveId som kontrollerar om anvädndaren har ett id 
     */
    constructor() {
        this.devtoolsOpen = false;
        this.shortcutUsed = false; 
        this.os = this.detectOS();
        this.SCDiv = new ShortcommandDiv(this.os);
        this.checkAndSaveId();
    }

    /**
     * Kontrollerar vilket operativsystem användaren använder
     */
    detectOS() {
        const platform = navigator.userAgent.toLowerCase();
        if (platform.includes('win')) return 'CTRL';
        if (platform.includes('mac')) return 'CMD';
        return 'CTRL/CMD';
    }

    /**
     * Genererar en slumpmässig sträng med 5 bokstäver
     */
    generateRandomString() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    /**
     * Kontrollera om "id" finns i chrome storage, om inte, skapa och spara det. Kallar på genereateRandomString för att skapa en slumpmässig sträng,
     * sätter sedan ihop det med stringen från dateobjektet. Sparar sedan id i chrome storage
     */
    checkAndSaveId() {
        chrome.storage.local.get(['id'], (result) => {
            if (!result.id) {
                const timestamp = Date.now(); 
                const randomString = this.generateRandomString();
                const id = `${timestamp}-${randomString}`;
                chrome.storage.local.set({ id: id }, () => {
                });
            } else {
            }
        });
    }
}

// Skapa en instans av ShortCommandNotifier
new ShortCommandNotifier();