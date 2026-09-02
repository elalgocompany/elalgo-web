import {
  NextRequest,
  NextResponse,
} from "next/server";


import {
  supabaseAdmin,
} from "@/lib/supabaseAdmin";


import {
  calculateAdvisorDashboardMetrics,
  isAdvisorDashboardRange,
} from "@/lib/advisor/calculateDashboardMetrics";


export async function GET(
  request: NextRequest
) {
  try {

    // ========================================
    // USER AUTHENTICATION
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
            "Invalid time range.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // FIND USER ADVISOR CONNECTION
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
          last_sync_at
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
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();


    if (connectionError) {
      throw new Error(
        `Could not load Advisor connection: ${connectionError.message}`
      );
    }


    if (!connection) {
      return NextResponse.json(
        {
          success: true,

          connected: false,
        }
      );
    }


    // ========================================
    // CALCULATE PERIOD METRICS
    // ========================================

    const metrics =
      await calculateAdvisorDashboardMetrics(
        connection.id,
        rangeValue
      );


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

        lastSyncAt:
          connection.last_sync_at,
      },

      metrics,
    });

  } catch (error) {

    console.error(
      "Advisor dashboard metrics error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not calculate Advisor dashboard metrics.",
      },
      {
        status: 500,
      }
    );
  }
}