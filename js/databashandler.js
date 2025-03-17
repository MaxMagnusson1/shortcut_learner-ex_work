// export async function sendDataToDatabase(apiUrl, data = null) {
//     try {
//         if (!data) {
//             data = await chrome.storage.local.get(null);
//         }


//         if (!data || Object.keys(data).length === 0) {
//             console.log("📭 Ingen data att skicka.");
//             return;
//         }
//             console.log("📭 Data att skicka:", data);
//         // Logga datan innan vi skickar den
//         console.log("📤 Skickar data till databasen:", JSON.stringify(data, null, 2));

//         const jsonData = JSON.stringify(data);

//         const response = await fetch(apiUrl, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: jsonData,
//         });

//         if (response.ok) {
//             console.log("✅ Data insatt i databasen!");
//             await chrome.storage.local.clear();
//             console.log("🗑 Lokal storage rensad.");
//         } else {
//             console.error("❌ Fel vid insättning i databasen:", response.statusText);
//         }
//     } catch (error) {
//         console.error("🚨 Fångat fel vid API-anrop:", error);
//     }
// }
