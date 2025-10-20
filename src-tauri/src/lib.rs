// Commands modules
mod commands;
use commands::usb::{detect_usb_devices, detect_ledger_devices};
use commands::ledger::{connect_ledger, disconnect_wallet, get_wallet_info};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            detect_usb_devices,
            detect_ledger_devices,
            connect_ledger,
            disconnect_wallet,
            get_wallet_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
