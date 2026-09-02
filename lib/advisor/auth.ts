import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function authenticateAdvisorKey(
  authorization: string | null
) {
  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return null;
  }

  const advisorKey =
    authorization
      .substring(7)
      .trim();

  if (
    !advisorKey.startsWith(
      "ela_adv_"
    )
  ) {
    return null;
  }

  const tokenHash =
    crypto
      .createHash("sha256")
      .update(advisorKey)
      .digest("hex");

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("advisor_connections")
      .select(`
        id,
        user_id,
        status,
        platform,
        account_number,
        broker,
        server,
        last_deal_time_msc
      `)
      .eq(
        "token_hash",
        tokenHash
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();

  if (
    error ||
    !data
  ) {
    return null;
  }

  return data;
}