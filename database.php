<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

/**
 * Databasanslutning till local databas, gör sedan en connection till databasen och skriver ut ett error om det blir fel och gör en exit.
 */
$servername = "localhost";
$username = "mm224zp";
$password = "GG7waK5g";
$dbname = "mm224zp_ex";
$port = 3306; 

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit;
}

/**
 * Rawdatan hämtas från php://input och dekodas till JSON.
 */
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

/**
 * Om data inte är tom och är en array, logga data och hämta ID, gui_actions och keyboard_shortcuts.
 * Om ID är null, skriv ut ett felmeddelande.
 */

if (!empty($data) && is_array($data)) {
    error_log("Decodad JSON: " . print_r($data, true));

    // 📌 **Hämta ID, gui_actions och keyboard_shortcuts**
    $id = isset($data['id']) ? $data['id'] : null;
    $gui_actions = isset($data['gui_actions']) ? $data['gui_actions'] : [];
    $keyboard_shortcuts = isset($data['keyboard_shortcuts']) ? $data['keyboard_shortcuts'] : [];

    if ($id === null) {
        echo json_encode(["status" => "error", "message" => "Missing ID"]);
        exit;
    }

    /**
     * Insättning i tabellen all_users. Kontrollerar ifall det är en GUI-action eller Keyboard Shortcut och sätter in det i tabellen tillsammans med en boolean, isItKeyBoardShortcut.
     */
    $insertQuery = "INSERT INTO data_from_all_users (shortcut, isItKeyBoardShortcut, user_id, url) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($insertQuery);

    /**
     * Loop genom GUI-actions och sätt in varje kommando som en egen insättning, sätter sedan in en boolean som är false.
     */
    foreach ($gui_actions as $url => $shortcuts) {
        foreach ($shortcuts as $shortcut => $count) {
            for ($i = 0; $i < $count; $i++) {
                $isKeyboardShortcut = false; // GUI-actions har false
                $stmt->bind_param("siss", $shortcut, $isKeyboardShortcut, $id, $url);
                $stmt->execute();
            }
        }
    }

    /**
     * Loop genom Keyboard Shortcuts och sätt in varje kommando som en egen insättning, sätter sedan in en boolean som är true.
     */
    foreach ($keyboard_shortcuts as $url => $shortcuts) {
        foreach ($shortcuts as $shortcut => $count) {
            for ($i = 0; $i < $count; $i++) {
                $isKeyboardShortcut = true; // Keyboard Shortcuts har true
                $stmt->bind_param("siss", $shortcut, $isKeyboardShortcut, $id, $url);
                $stmt->execute();
            }
        }
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Data inserted",
        "table" => "all_users"
    ]);
} else {
    error_log("JSON decode failed or data is empty!");
    echo json_encode(["status" => "error", "message" => "No data received"]);
}

$conn->close();
?>