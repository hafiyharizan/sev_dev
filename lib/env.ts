function must(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable ${name} (see .env.example)`);
  return value;
}

// NEXT_PUBLIC_* must be referenced literally so Next.js can inline them into client bundles.
export const supabaseUrl = () => must('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = () => must('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const siteUrl = () => must('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL);
export const serviceRoleKey = () => must('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
export const cronSecret = () => must('CRON_SECRET', process.env.CRON_SECRET);
