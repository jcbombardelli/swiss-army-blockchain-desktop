// src-tauri/src/commands/usb.rs
use tauri::command;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct USBDevice {
    pub vendor_id: u16,
    pub product_id: u16,
    pub device_name: String,
    pub connected: bool,
    pub serial_number: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LedgerDevice {
    pub vendor_id: u16,
    pub product_id: u16,
    pub device_name: String,
    pub connected: bool,
    pub serial_number: Option<String>,
    pub app_name: Option<String>,
    pub app_version: Option<String>,
    pub locked: bool,
}

// Vendores conhecidos de hardware wallets
const LEDGER_VENDOR_ID: u16 = 0x2c97;
const TREZOR_VENDOR_ID: u16 = 0x534c;

#[command]
pub async fn detect_usb_devices() -> Result<Vec<USBDevice>, String> {
    match rusb::devices() {
        Ok(devices) => {
            let mut usb_devices = Vec::new();

            for device in devices.iter() {
                if let Ok(device_desc) = device.device_descriptor() {
                    let device_name = get_device_name(device_desc.vendor_id(), device_desc.product_id());

                    usb_devices.push(USBDevice {
                        vendor_id: device_desc.vendor_id(),
                        product_id: device_desc.product_id(),
                        device_name,
                        connected: true,
                        serial_number: get_serial_number(&device),
                    });
                }
            }

            Ok(usb_devices)
        }
        Err(e) => Err(format!("Erro ao detectar dispositivos USB: {}", e)),
    }
}

#[command]
pub async fn detect_ledger_devices() -> Result<Vec<LedgerDevice>, String> {
    match rusb::devices() {
        Ok(devices) => {
            let mut ledger_devices = Vec::new();

            for device in devices.iter() {
                if let Ok(device_desc) = device.device_descriptor() {
                    // Verificar se é um dispositivo Ledger
                    if device_desc.vendor_id() == LEDGER_VENDOR_ID {
                        let device_name = get_ledger_device_name(device_desc.product_id());

                        ledger_devices.push(LedgerDevice {
                            vendor_id: device_desc.vendor_id(),
                            product_id: device_desc.product_id(),
                            device_name,
                            connected: true,
                            serial_number: get_serial_number(&device),
                            app_name: None, // Será preenchido após conectar
                            app_version: None,
                            locked: true, // Padrão como bloqueado
                        });
                    }
                }
            }

            Ok(ledger_devices)
        }
        Err(e) => Err(format!("Erro ao detectar dispositivos Ledger: {}", e)),
    }
}

fn get_device_name(vendor_id: u16, product_id: u16) -> String {
    match vendor_id {
        LEDGER_VENDOR_ID => get_ledger_device_name(product_id),
        TREZOR_VENDOR_ID => get_trezor_device_name(product_id),
        _ => format!("Dispositivo USB {:04x}:{:04x}", vendor_id, product_id),
    }
}

fn get_ledger_device_name(product_id: u16) -> String {
    match product_id {
        0x0001 => "Ledger Nano S".to_string(),
        0x0004 => "Ledger Nano X".to_string(),
        0x0005 => "Ledger Nano S Plus".to_string(),
        _ => format!("Ledger Device {:04x}", product_id),
    }
}

fn get_trezor_device_name(product_id: u16) -> String {
    match product_id {
        0x0001 => "Trezor One".to_string(),
        0x0002 => "Trezor Model T".to_string(),
        _ => format!("Trezor Device {:04x}", product_id),
    }
}

fn get_serial_number(device: &rusb::Device<rusb::GlobalContext>) -> Option<String> {
    // Implementar leitura do número serial se necessário
    // Isso pode requerer abrir o dispositivo
    None
}
