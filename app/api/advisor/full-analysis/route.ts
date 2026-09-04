import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

import {
  isAdvisorDashboardRange,
} from "@/lib/advisor/calculateDashboardMetrics";

import {
  calculateFullAdvisorAnalysis,
} from "@/lib/advisor/calculateFullAnalysis";


export async function GET(
  request: NextRequest
) {
  try {

    // ========================================
    // AUTHENTICATE USER
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
            "Invalid authentication session.",
        },
        {
          status: 401,
        }
      );
    }


    const user =
      userData.user;


    // ========================================
    // TIME RANGE
    // ========================================

    const rangeValue =
      request
        .nextUrl
        .searchParams
        .get(
          "range"
        ) ??
      "1m";


    if (
      !isAdvisorDashboardRange(
        rangeValue
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Invalid analysis range.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // FIND ACTIVE ADVISOR CONNECTION
    // ========================================

    const {
      data: connection,
      error: connectionError,
    } =
      await supabaseAdmin
        .from(
          "advisor_connections"
        )
        .select(`
          id,
          label,
          account_number,
          account_currency,
          broker,
          server,
          platform,
          last_balance,
          last_equity,
          last_sync_at,
          last_connected_at
        `)
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "status",
          "active"
        )
        .limit(
          1
        )
        .maybeSingle();


    if (connectionError) {
      throw new Error(
        `Could not load Advisor connection: ${connectionError.message}`
      );
    }


    // ========================================
    // NO CONNECTION
    // ========================================

    if (!connection) {
      return NextResponse.json({
        success: true,

        connected: false,

        connection:
          null,

        analysis:
          null,
      });
    }


    // ========================================
    // FULL ANALYSIS
    // ========================================

    const analysis =
      await calculateFullAdvisorAnalysis(
        connection.id,
        rangeValue
      );


    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json({
      success: true,

      connected: true,

      connection: {

        id:
          connection.id,

        label:
          connection.label,

        accountNumber:
          connection.account_number,

        currency:
          connection.account_currency ??
          "USD",

        broker:
          connection.broker,

        server:
          connection.server,

        platform:
          connection.platform,

        balance:
          connection.last_balance,

        equity:
          connection.last_equity,

        lastSyncAt:
          connection.last_sync_at,

        lastConnectedAt:
          connection.last_connected_at,
      },

      analysis,
    });

  } catch (error) {

    console.error(
      "Advisor full analysis error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not calculate Advisor analysis.",
      },
      {
        status: 500,
      }
    );
  }
}