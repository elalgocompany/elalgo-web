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
      user_id,
      license_id,
      platform,
    } = body;

    if (!user_id || !license_id || !platform) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing download information.",
        },
        { status: 400 }
      );
    }

    // Find license
    const {
      data: license,
      error: licenseError,
    } = await supabaseAdmin
      .from("licenses")
      .select(`
        id,
        user_id,
        product_id,
        status,
        expires_at
      `)
      .eq("id", license_id)
      .eq("user_id", user_id)
      .single();

    if (licenseError || !license) {
      return NextResponse.json(
        {
          success: false,
          message: "License not found.",
        },
        { status: 404 }
      );
    }

    if (license.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "License is not active.",
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
          success: false,
          message: "License has expired.",
        },
        { status: 403 }
      );
    }

    // Find product file
    const {
      data: productFile,
      error: fileError,
    } = await supabaseAdmin
      .from("product_files")
      .select("*")
      .eq("product_id", license.product_id)
      .eq("platform", platform.toLowerCase())
      .single();

    if (fileError || !productFile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Download file is not available for this platform.",
        },
        { status: 404 }
      );
    }

    // Create short-lived signed link
    const {
      data: signedData,
      error: signedError,
    } = await supabaseAdmin.storage
      .from("product-downloads")
      .createSignedUrl(
        productFile.file_path,
        60
      );

    if (signedError || !signedData) {
      console.error(
        "Signed URL error:",
        signedError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not create download link.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      download_url: signedData.signedUrl,
    });

  } catch (error) {
    console.error("Download API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}