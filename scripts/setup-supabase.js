/**
 * One-time setup script to create the portfolio-files storage bucket in Supabase.
 * Run with: node scripts/setup-supabase.js
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "Error: Missing SUPABASE_SERVICE_ROLE_KEY. Get it from Supabase Settings → API → Service Role Key"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupBucket() {
  console.log("Creating portfolio-files bucket...");

  try {
    // Create bucket
    const { data, error } = await supabase.storage.createBucket(
      "portfolio-files",
      {
        public: true,
        fileSizeLimit: 16 * 1024 * 1024, // 16MB
      }
    );

    if (error && error.message.includes("already exists")) {
      console.log("✓ Bucket 'portfolio-files' already exists");
    } else if (error) {
      console.error("Error creating bucket:", error);
      process.exit(1);
    } else {
      console.log("✓ Bucket created successfully:", data);
    }

    console.log("\n✓ Setup complete!");
    console.log("\nNext steps:");
    console.log("1. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (optional, for bucket setup)");
    console.log("2. Run: npm run dev");
    console.log("3. Go to /admin and upload files");
  } catch (err) {
    console.error("Setup error:", err.message);
    process.exit(1);
  }
}

setupBucket();
