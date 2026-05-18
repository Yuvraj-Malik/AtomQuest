// Client-side crypto helpers for ECDH (P-256) + AES-GCM message encryption.
// Uses Web Crypto API; intended for browser (client) only.

export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  );
  return keyPair;
}

export async function exportPublicKeyBase64(publicKey) {
  const raw = await window.crypto.subtle.exportKey('raw', publicKey);
  return bufferToBase64(raw);
}

export async function exportPrivateJwk(privateKey) {
  const jwk = await window.crypto.subtle.exportKey('jwk', privateKey);
  return jwk;
}

export async function importPublicKeyFromBase64(b64) {
  const raw = base64ToBuffer(b64);
  return await window.crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );
}

export async function importPrivateKeyFromJwk(jwk) {
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  );
}

export async function deriveSharedKey(privateKey, publicKey) {
  const derived = await window.crypto.subtle.deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return derived;
}

export async function encryptWithKey(sharedKey, plaintext) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);
  const cipher = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sharedKey, enc);
  return { ciphertext: bufferToBase64(cipher), iv: bufferToBase64(iv) };
}

export async function decryptWithKey(sharedKey, ciphertextBase64, ivBase64) {
  const cipher = base64ToBuffer(ciphertextBase64);
  const iv = base64ToBuffer(ivBase64);
  const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, sharedKey, cipher);
  return new TextDecoder().decode(plain);
}

function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function savePrivateJwkToLocal(userId, jwk) {
  try {
    localStorage.setItem(`chat_private_jwk_${userId}`, JSON.stringify(jwk));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadPrivateJwkFromLocal(userId) {
  try {
    const s = localStorage.getItem(`chat_private_jwk_${userId}`);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
