/**
 * T99 - Automated QA Validation Script
 * Checks database schema, migrations, and key configurations
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ValidationResult {
  test: string;
  passed: boolean;
  message?: string;
}

const results: ValidationResult[] = [];

function log(result: ValidationResult) {
  results.push(result);
  const icon = result.passed ? '✅' : '❌';
  console.log(
    `${icon} ${result.test}${result.message ? ` - ${result.message}` : ''}`
  );
}

async function validateDatabaseSchema() {
  console.log('\n🗄️  Validating Database Schema...\n');

  // Check critical tables exist
  const tables = ['sessions', 'turns', 'reports', 'entitlements', 'profiles'];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    log({
      test: `Table '${table}' exists`,
      passed: !error,
      message: error?.message,
    });
  }

  // Check critical columns in sessions table
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select(
      'id, plan_tier, current_stage, stages_planned, intro_text, conversation_summary'
    )
    .limit(1);

  log({
    test: 'Sessions table has paid tier fields (T84)',
    passed: !sessionsError && sessions !== null,
    message: sessionsError?.message,
  });

  // Check bridge_text column in turns table (T89)
  const { data: turns, error: turnsError } = await supabase
    .from('turns')
    .select('id, bridge_text')
    .limit(1);

  log({
    test: "Turns table has 'bridge_text' column (T89)",
    passed: !turnsError && turns !== null,
    message: turnsError?.message,
  });

  // Check conversation_summary in sessions (T95)
  const { error: summaryError } = await supabase
    .from('sessions')
    .select('conversation_summary')
    .limit(1);

  log({
    test: "Sessions table has 'conversation_summary' column (T95)",
    passed: !summaryError,
    message: summaryError?.message,
  });

  // Check reports table has feedback JSONB column
  const { error: reportsError } = await supabase
    .from('reports')
    .select('id, feedback')
    .limit(1);

  log({
    test: "Reports table has 'feedback' JSONB column",
    passed: !reportsError,
    message: reportsError?.message,
  });
}

async function validateStorageSetup() {
  console.log('\n📦 Validating Storage Setup...\n');

  const buckets = ['audio', 'uploads', 'reports'];

  for (const bucketName of buckets) {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    log({
      test: `Storage bucket '${bucketName}' exists`,
      passed: !error && data !== null,
      message: error?.message,
    });
  }
}

async function validateEntitlementsSystem() {
  console.log('\n🎟️  Validating Entitlements System...\n');

  // Check entitlements table structure
  const { data, error } = await supabase
    .from('entitlements')
    .select('id, user_id, type, status, metadata')
    .limit(1);

  log({
    test: 'Entitlements table has correct structure',
    passed: !error,
    message: error?.message,
  });

  // Check for at least one entitlement (optional)
  if (data && data.length > 0) {
    log({
      test: 'Sample entitlement found in database',
      passed: true,
      message: `${data.length} entitlement(s) in database`,
    });
  }
}

async function validateCacheSystem() {
  console.log('\n🔄 Validating Cache System...\n');

  try {
    // Import cache module
    const { researchCache } = await import('../lib/cache');
    const stats = researchCache.getStats();

    log({
      test: 'Cache system initialized',
      passed: true,
      message: `${stats.size} entries in cache`,
    });
  } catch (error) {
    log({
      test: 'Cache system initialized',
      passed: false,
      message:
        error instanceof Error ? error.message : 'Failed to import cache',
    });
  }
}

async function validateEnvironmentVariables() {
  console.log('\n🔐 Validating Environment Variables...\n');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    log({
      test: `${varName} is set`,
      passed: !!value && value.length > 10,
      message: value ? 'Set' : 'Missing',
    });
  }
}

async function runAllValidations() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  T99 - QA Validation Script            ║');
  console.log('║  InterviewLab Phase 8.5 Complete       ║');
  console.log('╚════════════════════════════════════════╝');

  await validateEnvironmentVariables();
  await validateDatabaseSchema();
  await validateStorageSetup();
  await validateEntitlementsSystem();
  await validateCacheSystem();

  console.log('\n' + '═'.repeat(50));
  console.log('📊 VALIDATION SUMMARY');
  console.log('═'.repeat(50) + '\n');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%\n`);

  if (failed > 0) {
    console.log('❌ VALIDATION FAILED - Please fix the issues above\n');
    process.exit(1);
  } else {
    console.log('✅ ALL VALIDATIONS PASSED - Ready for Phase 9!\n');
    process.exit(0);
  }
}

runAllValidations().catch((error) => {
  console.error('💥 Validation script crashed:', error);
  process.exit(1);
});
