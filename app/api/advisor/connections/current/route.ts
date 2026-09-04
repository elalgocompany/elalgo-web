import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

import {
  generateStableAdvisorKey,
} from "@/lib/advisor/generateStableKey";


export async function GET(
  request: NextRequest
) {
  try {
    // ========================================
    // AUTHENTICATION
    // ========================================

    const authorization =
      request.headers.get(
        "authorization"
      );


    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }


    const accessToken =
      authorization
        .slice(7)
        .trim();


    const {
      data: userData,
      error: userError,
    } =
      await supabaseAdmin
        .auth
        .getUser(
          accessToken
        );


    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid session.",
        },
        {
          status: 401,
        }
      );
    }


    const user =
      userData.user;


    // ========================================
    // FIND CURRENT CONNECTION
    // ========================================

    const {
      data: connection,
      error,
    } =
      await supabaseAdmin
        .from(
          "advisor_connections"
        )
        .select(`
          id,
          account_number,
          platform,
          broker,
          server,
          account_currency,
          last_balance,
          last_equity,
          last_deal_time_msc,
          last_sync_at,
          last_connected_at,
          status,
          created_at
        `)
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "status",
          "active"
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        )
        .limit(1)
        .maybeSingle();


    if (error) {
      throw new Error(
        `Could not load Advisor connection: ${error.message}`
      );
    }


    // ========================================
    // NO CONNECTION
    // ========================================

    if (!connection) {
      return NextResponse.json({
        success: true,
        connected: false,
        connection: null,
      });
    }


    // ========================================
    // RECREATE SAME STABLE KEY
    // ========================================

    const accountNumber =
      String(
        connection.account_number
      );


    const advisorKey =
      generateStableAdvisorKey(
        user.id,
        accountNumber
      );


    return NextResponse.json({
      success: true,

      connected: true,

      advisor_key:
        advisorKey,

      connection,
    });

  } catch (error) {
    console.error(
      "Current Advisor connection error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not load Advisor connection.",
      },
      {
        status: 500,
      }
    );
  }
}