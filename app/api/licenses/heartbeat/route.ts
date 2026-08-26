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
        product_id,
        platform,
        account_number,
        status,
        expires_at
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
          message: "Product does not match",
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
          message: "Platform does not match",
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
          message: "Account does not match",
        },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("licenses")
      .update({
        last_verified_at: now,
      })
      .eq("id", license.id);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          valid: false,
          message: "Failed to update heartbeat",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "Heartbeat successful",
      expires_at: license.expires_at,
    });
  } catch (error) {
    console.error("Heartbeat error:", error);

    return NextResponse.json(
      {
        valid: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}