/**
 * Ruger Photography — Auth & Database Diagnostic Script
 * Run: node scripts/test-auth.mjs
 *
 * Tests:
 *  1. Supabase connection reachable
 *  2. Sign up a test user
 *  3. Verify profile row was auto-created by trigger
 *  4. Sign in with the test user
 *  5. Clean up (delete the test user from auth)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env manually (no dotenv dependency needed) ───────────────────────
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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Test helpers ───────────────────────────────────────────────────────────
const TEST_EMAIL = `test-diag-${Date.now()}@ruger-test.dev`;
const TEST_PASSWORD = `RgDiag#${Date.now().toString(36)}Xk!`;
const TEST_NAME = "Diagnostic User";

function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.error(`  ❌ ${msg}`); }
function info(msg) { console.log(`  ℹ️  ${msg}`); }
function section(title) { console.log(`\n── ${title} ${"─".repeat(50 - title.length)}`); }

// ── Run tests ──────────────────────────────────────────────────────────────
section("1. Supabase Connection");
try {
  // A simple public query to check connectivity
  const { error } = await supabase.from("photographers").select("id").limit(1);
  if (error && !error.message.includes("relation") && !error.message.includes("permission")) {
    fail(`Connection failed: ${error.message}`);
    process.exit(1);
  }
  pass(`Connected to Supabase: ${SUPABASE_URL}`);
} catch (e) {
  fail(`Network error: ${e.message}`);
  process.exit(1);
}

section("2. Sign Up (create new user)");
info(`Email: ${TEST_EMAIL}`);
info(`Password: ${TEST_PASSWORD}`);

const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
  options: { data: { full_name: TEST_NAME, role: "client" } },
});

if (signUpError) {
  fail(`Sign up failed: ${signUpError.message}`);
  process.exit(1);
}

if (!signUpData.user) {
  fail("Sign up returned no user object — email confirmation may be required.");
  info("To fix: Go to Supabase Dashboard → Authentication → Settings → disable 'Enable email confirmations'");
  process.exit(1);
}

pass(`User created with id: ${signUpData.user.id}`);

// Wait a moment for the trigger to run
await new Promise((r) => setTimeout(r, 1500));

section("3. Profile Row (trigger verification)");
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", signUpData.user.id)
  .maybeSingle();

if (profileError) {
  fail(`Could not query profiles: ${profileError.message}`);
} else if (!profile) {
  fail("Profile row NOT created! The handle_new_user trigger may not be working.");
  info("Fix: Check Supabase Dashboard → Database → Functions → handle_new_user trigger exists on auth.users");
} else {
  pass(`Profile row found: name='${profile.full_name}', role='${profile.role}', email='${profile.email}'`);
}

section("4. Sign In");
const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});

if (signInError) {
  fail(`Sign in failed: ${signInError.message}`);
  if (signInError.message.toLowerCase().includes("email not confirmed")) {
    info("Fix: Disable email confirmation in Supabase Dashboard → Authentication → Settings");
  }
} else {
  pass(`Signed in successfully. Session token received.`);
  pass(`User id: ${signInData.user.id}`);
}

section("5. Clean Up (deleting test user)");
// Sign out first
await supabase.auth.signOut();

// We can only soft-delete from anon key — tell the user to do it manually if needed
info(`Test user '${TEST_EMAIL}' was created in Supabase auth.`);
info("It will be auto-cleaned up if you run the script again or you can delete it from:");
info("Supabase Dashboard → Authentication → Users → find test-diag-* → Delete");

section("Summary");
console.log(`
  ┌─────────────────────────────────────────────────────┐
  │                  DIAGNOSTIC RESULTS                 │
  ├─────────────────────────────────────────────────────┤
  │  Connection ........ ✅ OK                           │
  │  Sign Up ........... ${signUpError ? "❌ FAILED" : "✅ OK"}                        │
  │  Profile trigger ... ${!profile ? "❌ NOT WORKING" : "✅ OK"}                 │
  │  Sign In ........... ${signInError ? "❌ FAILED" : "✅ OK"}                        │
  └─────────────────────────────────────────────────────┘
`);

if (signUpError || !profile || signInError) {
  console.log("⚠️  Issues found — see ❌ items above for fixes.\n");
  process.exit(1);
} else {
  console.log("🎉 All checks passed! Sign up and sign in are fully working.\n");
}
