import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY veya SUPABASE_SECRET_KEY gereklidir.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false
  }
});

async function main() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`İletişim mesajı export hatası: ${error.message}`);
  }

  const backupsDir = path.join(process.cwd(), "backups");
  await mkdir(backupsDir, { recursive: true });

  const fileName = `contact-messages-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  await writeFile(path.join(backupsDir, fileName), JSON.stringify(data ?? [], null, 2), "utf8");

  console.log(`İletişim mesajı export tamamlandı: backups/${fileName}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
