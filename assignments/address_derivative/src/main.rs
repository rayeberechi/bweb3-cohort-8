// use bip39::{Language, Mnemonic, rand::Rng};
// use bip39::rand::rngs::{self, OsRng};
// // use k256::schnorr::SigningKey;
// use tiny_hderive::bip32::ExtendedPrivKey;
// use k256::ecdsa::SigningKey;
// use k256::elliptic_curve::sec1::ToEncodedPoint;
// use k256::elliptic_curve::FieldBytes;
// use sha3::{Digest, Keccak256};

use bip39::{Language, Mnemonic};
use bip39::rand::rngs::OsRng;

use tiny_hderive::bip32::ExtendedPrivKey;

use k256::ecdsa::SigningKey;
use k256::elliptic_curve::sec1::ToEncodedPoint;
use k256::elliptic_curve::FieldBytes;

use sha3::{Digest, Keccak256};


fn main() {
    let mut rng = OsRng;  


      let mnemonic = Mnemonic::generate_in_with(&mut rng, Language::English, 12).expect("failed to generate mnemonic");
    println!("Mnemonic phrase");
    println!("{}", mnemonic);
    
    let entropy = mnemonic.to_entropy();
    println!("Entropy (hex): {}", hex::encode(entropy));

    //  let seed = Seed::new(&mnemonic, "");
    let seed = mnemonic.to_seed("");

    // 2. Master private key
    // let master_key = ExtendedPrivKey::new(seed.as_bytes())
    //     .expect("Failed to create master key");

    // let child_key = ExtendedPrivKey::derive(seed.as_slice(), "m/44'/60'/0'/0/0").expect("Derivation failed");
    // // 3. Derive Ethereum path: m/44'/60'/0'/0/0
    // // let derivation_path = "m/44'/60'/0'/0/0";
    // // let child_key = master_key
    // //     .derive(derivation_path)
    // //     .expect("Derivation failed");

    // // 4. Get secp256k1 private key
    // let secret = FieldBytes::from(child_key.secret());
    // let signing_key = SigningKey::from_bytes(&secret).expect("Invalid private key");
    // // let signing_key = SigningKey::from_bytes(child_key.secret()).expect("Invalid private key");

    // // 5. Get uncompressed public key
    // let public_key = signing_key.verifying_key();
    // let encoded = public_key.to_encoded_point(false);
    // let pubkey_bytes = encoded.as_bytes();

    // // Remove 0x04 prefix
    // let pubkey = &pubkey_bytes[1..];

    // // 6. Keccak256 hash
    // let hash = Keccak256::digest(pubkey);

    // // 7. Ethereum address = last 20 bytes
    // let address = &hash[12..];

    // println!("Ethereum address: 0x{}", hex::encode(address));

    let child_key = ExtendedPrivKey::derive(seed.as_slice(),"m/44'/60'/0'/0/0").expect("Derivation failed");

    // secp256k1 private key
    let signing_key = SigningKey::from_slice(&child_key.secret())
        .expect("Invalid private key");

    // uncompressed public key
    let public_key = signing_key.verifying_key();
    let encoded = public_key.to_encoded_point(false);
    let pubkey_bytes = encoded.as_bytes();
    let pubkey = &pubkey_bytes[1..];

    let hash = Keccak256::digest(pubkey);
    let address = &hash[12..];

    println!("Ethereum address: 0x{}", hex::encode(address));
}