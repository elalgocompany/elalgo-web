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
      product_id,
      platform,
    } = body;

    if (!product_id || !platform) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing download information.",
        },
        { status: 400 }
      );
    }

    // Check that this really is a free product.
    const {
      data: product,
      error: productError,
    } = await supabaseAdmin
      .from("products")
      .select(`
        id,
        access_type
      `)
      .eq("id", product_id)
      .single();

    if (
      productError ||
      !product
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    if (product.access_type !== "free") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This product requires a license.",
        },
        { status: 403 }
      );
    }

    // Find the requested MT4/MT5 file.
    const {
      data: productFile,
      error: fileError,
    } = await supabaseAdmin
      .from("product_files")
      .select(`
        id,
        file_path,
        platform
      `)
      .eq("product_id", product_id)
      .eq(
        "platform",
        platform.toLowerCase()
      )
      .single();

    if (
      fileError ||
      !productFile
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This platform download is not available.",
        },
        { status: 404 }
      );
    }

    const {
      data: signedData,
      error: signedError,
    } = await supabaseAdmin.storage
      .from("product-downloads")
      .createSignedUrl(
        productFile.file_path,
        60
      );

    if (
      signedError ||
      !signedData
    ) {
      console.error(
        "Free download signed URL error:",
        signedError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not prepare download.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      download_url:
        signedData.signedUrl,
    });

  } catch (error) {
    console.error(
      "Free download API error:",
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