import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

import {
  generateStableAdvisorKey,
  hashAdvisorKey,
} from "@/lib/advisor/generateStableKey";


type SwitchConnectionBody = {
  account_number?: string;

  confirm?: boolean;
};


export async function POST(
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
    // READ BODY
    // ========================================

    let body:
      SwitchConnectionBody;


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


    const newAccountNumber =
      body.account_number
        ?.trim();


    if (!newAccountNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "New MetaTrader account number is required.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      !/^\d+$/.test(
        newAccountNumber
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "MetaTrader account number must contain only numbers.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // EXPLICIT CONFIRMATION
    // ========================================

    if (
      body.confirm !== true
    ) {
      return NextResponse.json(
        {
          success: false,

          confirmation_required:
            true,

          error:
            "Account switch confirmation is required.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // CURRENT CONNECTION
    // ========================================

    const {
      data:
        currentConnection,
      error:
        currentError,
    } =
      await supabaseAdmin
        .from(
          "advisor_connections"
        )
        .select(`
          id,
          account_number
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


    if (currentError) {
      throw new Error(
        `Could not load Advisor connection: ${currentError.message}`
      );
    }


    if (!currentConnection) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No active Advisor connection exists.",
        },
        {
          status: 404,
        }
      );
    }


    const previousAccount =
      String(
        currentConnection
          .account_number
      );


    // ========================================
    // SAME ACCOUNT
    // ========================================

    if (
      previousAccount ===
      newAccountNumber
    ) {
      const advisorKey =
        generateStableAdvisorKey(
          user.id,
          newAccountNumber
        );


      return NextResponse.json({
        success: true,

        changed: false,

        advisor_key:
          advisorKey,

        connection:
          currentConnection,

        message:
          "This MetaTrader account is already connected.",
      });
    }


    // ========================================
    // GENERATE NEW STABLE KEY
    // ========================================

    const advisorKey =
      generateStableAdvisorKey(
        user.id,
        newAccountNumber
      );


    const tokenHash =
      hashAdvisorKey(
        advisorKey
      );


    const tokenPrefix =
      advisorKey.slice(
        0,
        18
      );


    // ========================================
    // ATOMIC ACCOUNT REPLACEMENT
    // ========================================

    const {
      data:
        newConnectionId,
      error:
        switchError,
    } =
      await supabaseAdmin
        .rpc(
          "switch_advisor_connection",
          {
            p_user_id:
              user.id,

            p_new_account_number:
              newAccountNumber,

            p_token_hash:
              tokenHash,

            p_token_prefix:
              tokenPrefix,
          }
        );


    if (switchError) {
      throw new Error(
        `Could not switch Advisor account: ${switchError.message}`
      );
    }


    if (!newConnectionId) {
      throw new Error(
        "Advisor account switch did not return a new connection."
      );
    }


    // ========================================
    // LOAD NEW CONNECTION
    // ========================================

    const {
      data:
        newConnection,
      error:
        newConnectionError,
    } =
      await supabaseAdmin
        .from(
          "advisor_connections"
        )
        .select(`
          id,
          account_number,
          platform,
          token_prefix,
          status,
          broker,
          server,
          account_currency,
          last_balance,
          last_equity,
          last_deal_time_msc,
          last_sync_at,
          last_connected_at,
          created_at
        `)
        .eq(
          "id",
          newConnectionId
        )
        .single();


    if (newConnectionError) {
      throw new Error(
        `Account changed, but the new connection could not be loaded: ${newConnectionError.message}`
      );
    }


    // ========================================
    // SUCCESS
    // ========================================

    return NextResponse.json({
      success: true,

      changed: true,

      previous_account:
        previousAccount,

      new_account:
        newAccountNumber,

      advisor_key:
        advisorKey,

      connection:
        newConnection,

      message:
        "MetaTrader account changed successfully.",
    });

  } catch (error) {

    console.error(
      "Switch Advisor account error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not switch Advisor account.",
      },
      {
        status: 500,
      }
    );
  }
}