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
        broker,
        server,
        status,
        expires_at,
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

    const now = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("licenses")
      .update({
        account_verified_at: now,
        last_verified_at: now,
        broker: broker || null,
        server: server || null,
      })
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
        expires_at: license.expires_at,
        status: license.status,
      },
    });
  } catch (error) {
    console.error("License API error:", error);

    return NextResponse.json(
      {
        valid: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}