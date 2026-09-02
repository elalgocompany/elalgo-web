import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  authenticateAdvisorKey,
} from "@/lib/advisor/auth";

import {
  normalizeAdvisorTrades,
} from "@/lib/advisor/normalizeTrades";


type NormalizeBody = {
  account_number?: string;
  platform?: string;
};


export async function POST(
  request: NextRequest
) {
  try {

    // ========================================
    // AUTHENTICATE
    // ========================================

    const connection =
      await authenticateAdvisorKey(
        request.headers.get(
          "authorization"
        )
      );


    if (!connection) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Invalid or revoked Advisor key.",
        },
        {
          status: 401,
        }
      );
    }


    // ========================================
    // BODY
    // ========================================

    let body:
      NormalizeBody;


    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,

          error:
            "Invalid JSON body.",
        },
        {
          status: 400,
        }
      );
    }


    const accountNumber =
      body.account_number
        ?.trim();


    if (!accountNumber) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Account number is required.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // ACCOUNT VERIFICATION
    // ========================================

    if (
      String(
        connection.account_number
      ) !==
      accountNumber
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Advisor key does not belong to this MetaTrader account.",
        },
        {
          status: 409,
        }
      );
    }


    if (
      connection.platform !==
      body.platform
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Platform does not match Advisor connection.",
        },
        {
          status: 409,
        }
      );
    }


    if (
      body.platform !== "mt5"
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "V1 normalization currently supports MT5.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // NORMALIZE
    // ========================================

    const result =
      await normalizeAdvisorTrades(
        connection.id,

        connection.user_id,

        "mt5"
      );


    return NextResponse.json({
      success: true,

      ...result,
    });

  } catch (error) {

    console.error(
      "Advisor normalization error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Normalization failed.",
      },
      {
        status: 500,
      }
    );
  }
}