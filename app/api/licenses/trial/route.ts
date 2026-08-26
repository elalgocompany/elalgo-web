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
      product_id,
      account_number,
      platform,
      user_id,
    } = body;

    if (
      !product_id ||
      !account_number ||
      !platform ||
      !user_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields.",
        },
        { status: 400 }
      );
    }

    // Check whether this MetaTrader account
    // already used a trial for this product.
    const { data: existingTrial, error: trialError } =
      await supabaseAdmin
        .from("licenses")
        .select("id")
        .eq("product_id", product_id)
        .eq("account_number", String(account_number))
        .eq("license_kind", "trial")
        .maybeSingle();

    if (trialError) {
      console.error("Trial check error:", trialError);

      return NextResponse.json(
        {
          success: false,
          message: "Could not check trial eligibility.",
        },
        { status: 500 }
      );
    }

    if (existingTrial) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This MetaTrader account has already used its free trial for this product.",
        },
        { status: 409 }
      );
    }

    const licenseKey =
      `ELALGO-TRIAL-${crypto.randomUUID()}`;

    const { data: license, error: createError } =
      await supabaseAdmin
        .from("licenses")
        .insert({
          user_id,
          product_id,

          account_number: String(account_number),

          platform: platform.toLowerCase(),

          license_key: licenseKey,

          license_kind: "trial",

          trial_started_at: null,

          trial_duration_days: 7,

          expires_at: null,

          status: "active",
        })
        .select()
        .single();

    if (createError) {
      console.error(
        "Trial creation error:",
        createError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Failed to create trial license.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your 7-day trial has been created.",
      license,
    });
  } catch (error) {
    console.error("Trial API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}