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
    // ENSURE USAGE EXISTS
    // ========================================

    const {
      error: usageInitError,
    } =
      await supabaseAdmin
        .from(
          "advisor_usage"
        )
        .upsert(
          {
            user_id:
              user.id,
          },
          {
            onConflict:
              "user_id",

            ignoreDuplicates:
              true,
          }
        );


    if (usageInitError) {
      throw new Error(
        `Could not initialize Advisor usage: ${usageInitError.message}`
      );
    }


    // ========================================
    // LOAD USAGE
    // ========================================

    const {
      data: usageData,
      error: usageError,
    } =
      await supabaseAdmin
        .from(
          "advisor_usage"
        )
        .select(`
          account_switches_used,
          account_switch_limit
        `)
        .eq(
          "user_id",
          user.id
        )
        .single();


    if (usageError) {
      throw new Error(
        `Could not load Advisor usage: ${usageError.message}`
      );
    }


    const used =
      usageData
        .account_switches_used ??
      0;


    const unlimited =
      usageData
        .account_switch_limit ===
      null;


    const limit =
      unlimited
        ? null
        : (
            usageData
              .account_switch_limit ??
            10
          );


    const remaining =
      unlimited
        ? null
        : Math.max(
            (limit ?? 0) -
              used,
            0
          );


    const usage = {
      used,
      limit,
      remaining,
      unlimited,
    };


    // ========================================
    // LOAD CONNECTION
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

        connection: null,

        advisor_key: null,

        usage,
      });
    }


    // ========================================
    // RECREATE STABLE KEY
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

      usage,
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