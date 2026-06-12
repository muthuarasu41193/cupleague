/** Characters used for 6-char invite codes (no ambiguous 0/O, 1/I) */
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generate a random 6-character invite code */
export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}
