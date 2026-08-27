import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      license_key,
      account_number,
      platform,
      product_id,
      broker,
      server,
    } = body;

    if (
      !license_key ||
      !account_number ||
      !platform ||
      !product_id
    ) {
      return NextResponse.json(
        {
          valid: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const { data: license, error } = await supabaseAdmin
      .from("licenses")
      .select(`
        id,
        license_key,
        user_id,
        product_id,
        platform,
        account_number,
        status,
        expires_at,
        license_kind,
        trial_started_at,
        trial_duration_days,
        account_selected_at,
        account_verified_at,
        products (
          id,
          title
        )
      `)
      .eq("license_key", license_key)
      .single();

    if (error || !license) {
      return NextResponse.json(
        {
          valid: false,
          message: "License not found",
        },
        { status: 404 }
      );
    }

    if (license.status !== "active") {
      return NextResponse.json(
        {
          valid: false,
          message: "License is not active",
        },
        { status: 403 }
      );
    }

    if (
      license.expires_at &&
      new Date(license.expires_at) < new Date()
    ) {
      return NextResponse.json(
        {
          valid: false,
          message: "License has expired",
        },
        { status: 403 }
      );
    }

    if (license.product_id !== product_id) {
      return NextResponse.json(
        {
          valid: false,
          message: "Product does not match license",
        },
        { status: 403 }
      );
    }

    if (
      license.platform &&
      license.platform.toLowerCase() !==
        platform.toLowerCase()
    ) {
      return NextResponse.json(
        {
          valid: false,
          message: "Platform does not match license",
        },
        { status: 403 }
      );
    }

    if (!license.account_number) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "No MetaTrader account has been selected",
        },
        { status: 403 }
      );
    }

    if (
      license.account_number !==
      String(account_number)
    ) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "MetaTrader account does not match license",
        },
        { status: 403 }
      );
    }

    const now = new Date();
    let responseExpiresAt = license.expires_at;
const updateData: Record<string, string | null> = {
  account_verified_at: now.toISOString(),
  last_verified_at: now.toISOString(),

};

// If this is a trial and it has never been activated,
// start the trial now.
if (
  license.license_kind === "trial" &&
  !license.trial_started_at
) {
  const trialDays =
    license.trial_duration_days || 7;

  const expiresAt = new Date(
    now.getTime() +
      trialDays * 24 * 60 * 60 * 1000
  );

  updateData.trial_started_at =
    now.toISOString();

  updateData.expires_at =
    expiresAt.toISOString();
}


  let remainingSeconds: number | null = null;

      if (responseExpiresAt) {
        remainingSeconds = Math.max(
          0,
          Math.floor(
            (new Date(responseExpiresAt).getTime() -
              Date.now()) /
              1000
          )
        );
      }

const { error: updateError } = await supabaseAdmin
  .from("licenses")
  .update(updateData)
  .eq("id", license.id);

    if (updateError) {
      console.error(
        "License verification update error:",
        updateError
      );
      
      return NextResponse.json(
        {
          valid: false,
          message: "Failed to verify license",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "License verified successfully",

      license: {
        id: license.id,
        product_id: license.product_id,
        status: license.status,
        license_kind: license.license_kind,

        expires_at: responseExpiresAt,

        remaining_seconds:remainingSeconds ,
      },
    });
  } catch (error) {
  console.error("License API error:", error);

  return NextResponse.json(
    {
      valid: false,
      message:
        error instanceof Error
          ? error.message
          : "Internal server error",
    },
    { status: 500 }
  );
}
}