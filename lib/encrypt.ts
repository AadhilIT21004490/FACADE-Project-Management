import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_STR = process.env.VAULT_ENCRYPTION_KEY as string;

function getKey(): Buffer {
  if (!KEY_STR) throw new Error("VAULT_ENCRYPTION_KEY is not set");
  // The user generated a base64 key, so decode from base64
  const key = Buffer.from(KEY_STR, "base64");
  if (key.length !== 32)
    throw new Error("VAULT_ENCRYPTION_KEY must be exactly 32 bytes (44 base64 chars)");
  return key;
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv) as crypto.CipherGCM;
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Store: iv(12) + authTag(16) + ciphertext — all base64 joined with colons
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(ciphertext: string): string {
  const key = getKey();
  const [ivHex, authTagHex, encHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv) as crypto.DecipherGCM;
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
