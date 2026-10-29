/**
 * Helper to generate and validate unique user codes consisting of
 * a combination of 4 letters and 4 numbers (total 8 characters).
 * Example: "B8K4P2X9", "SD87BP24", "FW85ST02"
 */

export function isValidUniqueCode(code: string): boolean {
  if (!code || code.length !== 8) return false;
  const clean = code.toUpperCase();
  const letters = (clean.match(/[A-Z]/g) || []).length;
  const numbers = (clean.match(/[0-9]/g) || []).length;
  return letters === 4 && numbers === 4;
}

/**
 * Generates an 8-character unique code with exactly 4 letters and 4 numbers.
 * The characters are interleaved (Letter-Number-Letter-Number-Letter-Number-Letter-Number)
 * to make the combination unmistakable, clean, and easy to read.
 */
export function generateUniqueUserCode(existingCodes: (string | undefined)[] = []): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 23 distinct uppercase letters (excluding I, O to prevent confusion)
  const numbers = '23456789'; // distinct digits (excluding 0, 1)
  const existingSet = new Set(existingCodes.filter(Boolean).map((c) => c?.toUpperCase()));

  for (let attempt = 0; attempt < 5000; attempt++) {
    const l: string[] = [];
    for (let i = 0; i < 4; i++) {
      l.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }

    const n: string[] = [];
    for (let i = 0; i < 4; i++) {
      n.push(numbers.charAt(Math.floor(Math.random() * numbers.length)));
    }

    // Interleave: Letter Number Letter Number Letter Number Letter Number
    const code = `${l[0]}${n[0]}${l[1]}${n[1]}${l[2]}${n[2]}${l[3]}${n[3]}`;
    if (!existingSet.has(code)) {
      return code;
    }
  }

  // Fallback with current timestamp slice (4 digits) + 4 letters
  const ts = Date.now().toString().slice(-4);
  return `BP${ts}KR`;
}

/**
 * Creates a unique username by attaching the 8-character unique code
 * e.g., "mariaguru" -> "mariaguru_b8k4p2x9" or simply "b8k4p2x9"
 */
export function makeUniqueUsername(baseName: string, uniqueCode: string): string {
  const cleanBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanCode = uniqueCode.toLowerCase();
  if (!cleanBase) return cleanCode;
  return `${cleanBase}_${cleanCode}`;
}
