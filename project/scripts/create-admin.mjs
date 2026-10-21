/**
 * Ruger Photography — Create Admin User Script
 * Run: node scripts/create-admin.mjs
 *
 * Creates an admin account:
 *   Email:    admin@ruger.com
 *   Password: Ruger@Admin2026
 *   Role:     admin
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env manually ─────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(__dirname, "..", ".env");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    env[key.trim()] = rest.join("=").trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ADMIN_EMAIL    = "admin@ruger.com";
const ADMIN_PASSWORD = "Ruger@Admin2026";
const ADMIN_NAME     = "Admin";

console.log("\n🔧 Ruger — Admin Account Setup\n");

// ── Step 1: Try signing in first (account may already exist) ───────────────
console.log("Step 1: Checking if admin account already exists...");
const { data: existingSignIn, error: existingErr } =
  await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

if (existingSignIn?.user) {
  console.log("  ✅ Admin account already exists — signed in.\n");

  // Make sure role is admin
  const { error: roleErr } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", existingSignIn.user.id);

  if (roleErr) {
    console.log(`  ⚠️  Could not set role to admin: ${roleErr.message}`);
  } else {
    console.log("  ✅ Profile role confirmed as 'admin'.\n");
  }

  await supabase.auth.signOut();
  printCredentials();
  process.exit(0);
}

// ── Step 2: Sign up the admin account ─────────────────────────────────────
console.log("Step 2: Creating admin account...");
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  options: {
    data: { full_name: ADMIN_NAME, role: "client" }, // start as client, promote below
  },
});

if (signUpError) {
  console.error(`  ❌ Sign up failed: ${signUpError.message}`);
  process.exit(1);
}

if (!signUpData.user) {
  console.error("  ❌ No user returned. Email confirmation may be required.");
  console.log("  Fix: Supabase Dashboard → Authentication → Settings → disable email confirmations");
  process.exit(1);
}

console.log(`  ✅ Account created (id: ${signUpData.user.id})`);

// Wait for trigger to create the profile row
await new Promise((r) => setTimeout(r, 1500));

// ── Step 3: Sign in and promote to admin ───────────────────────────────────
console.log("Step 3: Signing in and promoting to admin role...");
const { data: signInData, error: signInError } =
  await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

if (signInError) {
  console.error(`  ❌ Sign in failed: ${signInError.message}`);
  process.exit(1);
}
console.log("  ✅ Signed in.");

// Update profile role to 'admin'
const { error: updateErr } = await supabase
  .from("profiles")
  .update({ role: "admin", full_name: ADMIN_NAME })
  .eq("id", signInData.user.id);

if (updateErr) {
  console.error(`  ❌ Could not set admin role: ${updateErr.message}`);
  console.log("     This may be an RLS issue. Try again after the account is fully created.");
  process.exit(1);
}
console.log("  ✅ Profile role set to 'admin'.");

// ── Step 4: Verify ─────────────────────────────────────────────────────────
console.log("Step 4: Verifying...");
const { data: profile, error: profileErr } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", signInData.user.id)
  .maybeSingle();

if (profileErr || !profile) {
  console.error(`  ❌ Could not verify profile: ${profileErr?.message}`);
  process.exit(1);
}

console.log(`  ✅ Profile: name='${profile.full_name}', role='${profile.role}'`);

await supabase.auth.signOut();

printCredentials();

function printCredentials() {
  console.log(`
╔══════════════════════════════════════════════╗
║           ADMIN ACCOUNT READY ✅              ║
╠══════════════════════════════════════════════╣
║  URL:      http://localhost:5173/sign-in      ║
║  Email:    admin@ruger.com                   ║
║  Password: Ruger@Admin2026                   ║
║  Role:     admin                             ║
╚══════════════════════════════════════════════╝
`);
}
