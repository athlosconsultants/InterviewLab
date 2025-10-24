import { createHash } from 'crypto';

/**
 * Hashes a device fingerprint using SHA-256 to avoid storing raw fingerprint data.
 * @param fingerprint - A string representing the device fingerprint.
 * @returns A SHA-256 hash of the fingerprint.
 */
export function hashDevice(fingerprint: string): string {
  if (!fingerprint) {
    throw new Error('Fingerprint cannot be empty');
  }

  const hash = createHash('sha256');
  hash.update(fingerprint);
  return hash.digest('hex');
}
