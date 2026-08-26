import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const {
      user_id,
      product_id,
      plan_id,
    } = body;

    if (
      !user_id ||
      !product_id ||
      !plan_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing purchase information.",
        },
        { status: 400 }
      );
    }

    // Load the REAL plan from the database.
    // Never trust price/license information
    // coming from the browser.

    const {
      data: plan,
      error: planError,
    } = await supabaseAdmin
      .from("product_plans")
      .select("*")
      .eq("id", plan_id)
      .eq("product_id", product_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid product or license plan.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // CREATE PURCHASE
    // -----------------------------

    const {
      data: purchase,
      error: purchaseError,
    } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id,
        product_id,
        plan_id: plan.id,

        amount: plan.price,

        currency: "USD",

        status: "completed",
      })
      .select()
      .single();

    if (purchaseError || !purchase) {
      console.error("Purchase creation error:", purchaseError);

      return NextResponse.json(
        {
          success: false,
          message: purchaseError?.message || "Could not create purchase.",
          details: purchaseError,
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // CALCULATE EXPIRATION
    // -----------------------------

    let expiresAt: string | null = null;

    if (
      plan.license_kind !== "lifetime" &&
      plan.duration_days
    ) {
      const expiration = new Date();

      expiration.setDate(
        expiration.getDate() +
          plan.duration_days
      );

      expiresAt =
        expiration.toISOString();
    }

    // -----------------------------
    // CREATE LICENSE
    // -----------------------------

    const licenseKey =
      `ELALGO-${crypto.randomUUID()}`;

    const {
      data: license,
      error: licenseError,
    } = await supabaseAdmin
      .from("licenses")
      .insert({
        user_id,

        product_id,

        plan_id: plan.id,

        purchase_id: purchase.id,

        license_key: licenseKey,

        license_kind:
          plan.license_kind,

        status: "active",

        expires_at: expiresAt,

        account_number: null,

        account_selected_at: null,

        account_verified_at: null,

        last_verified_at: null,

        platform:
          plan.platform || null,
      })
      .select()
      .single();

    if (licenseError || !license) {
      console.error(
        "License creation error:",
        licenseError
      );

      // The purchase was created but license creation
      // failed. We'll make this transactional later.

      return NextResponse.json(
        {
          success: false,
          message:
            "Purchase created, but license creation failed.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Purchase completed successfully.",

      purchase_id:
        purchase.id,

      license_id:
        license.id,
    });

  } catch (error) {
    console.error(
      "Mock checkout error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error.",
      },
      { status: 500 }
    );
  }
}