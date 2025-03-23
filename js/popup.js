document.addEventListener("DOMContentLoaded", function () {
    /**
     * Dateobj för start- och sluttid för att visa knappen samt prompts
     */
    // let startTime = new Date("2025-04-23T15:10:00").getTime(); //detta är när prompts ska börja visas 
    // let endTime = new Date("2025-04-23T14:56:00").getTime(); 

     let startTime = new Date("2025-03-31T00:00:01").getTime(); 
     let endTime = new Date("2025-04-15T00:00:01").getTime(); 

    /**
     * Timer element som räknar ner tiden till att knappen visas 
     */
    let timerElement = document.createElement("div");
    timerElement.id = "countdownTimer";
    timerElement.style.fontSize = "12px";
    timerElement.style.marginBottom = "10px";
    document.body.appendChild(timerElement);


    /**
     * Funktion som uppdaterar timern varje sekund och tar bort den när tiden gått ut
     */
    function updateCountdown() {

        let now = new Date().getTime();
        let timeLeft = startTime - now;
        if (timeLeft > 0) {
            let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            timerElement.innerHTML = `<strong>Klicka här om:</strong><br/> ${days}d ${hours}h ${minutes}m`;
        } else { 

            timerElement.remove();
            checkTime(); 
            clearInterval(countdownInterval); 
        }
    }

    /**
     * Uppdaterar timern direkt vid start och sedan varje sekund
     */
    let countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); 


    /**
     * Funktion för att kontrollera tid och visa knappen när tiden är inne, sparar isPromptsVisible i chrome storage för att shortcommand_div ska veta att den ska prompta 
     */
    function checkTime() {
        let now = new Date().getTime();
        let isVisible = now >= startTime && now <= endTime; 

        let buttonElement = document.getElementById("shortcutButton");

        /**
         * Knapp som leder till extern sida
         */
        
        if (isVisible) {
            if (!buttonElement) {
                buttonElement = document.createElement("button");
                buttonElement.id = "shortcutButton";
                buttonElement.textContent = "Fler kortkommandon";
                buttonElement.style.padding = "10px 15px";
                buttonElement.style.fontSize = "16px";
                buttonElement.style.cursor = "pointer";
                buttonElement.style.border = "none";
                buttonElement.style.backgroundColor = "#007bff";
                buttonElement.style.color = "white";
                buttonElement.style.borderRadius = "5px";

                buttonElement.addEventListener("click", function () {
                    window.open("https://shortcutsbyshortcutlearner.netlify.app/shortcut.html", "_blank", "noopener,noreferrer");
                });

                document.body.appendChild(buttonElement);
            } else {
                buttonElement.style.display = "block"; 
            }
        } else {
            if (buttonElement) {
                buttonElement.style.display = "none";
            }
        }
    }

    setInterval(checkTime, 1000);
});
