/**
 * Generates a bcrypt hash for the admin password.
 * Usage: npm run hash-password -- "your-password-here"
 * Paste the output into .env.local as ADMIN_PASSWORD_HASH.
 */
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run hash-password -- \"your-password\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
// Next.js's .env loader expands $VAR sequences, which corrupts bcrypt hashes
// (they're full of $). Escape every "$" as "\$" so it's stored literally.
const escaped = hash.replace(/\$/g, "\\$");
console.log("\nAdd this to .env.local (dollar signs escaped for Next.js's env loader):\n");
console.log(`ADMIN_PASSWORD_HASH=${escaped}\n`);
