import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hsdwohjndmneatdczypw.supabase.co";
const supabasePublishableKey =
  "sb_publishable_9v4OBTMEROb7_2G-LJ1Gag_b_aos7mv";

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);