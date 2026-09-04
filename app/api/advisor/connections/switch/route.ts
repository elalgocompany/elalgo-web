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


type SwitchRpcResult = {
  success: boolean;

  changed?: boolean;

  code?: string;

  message?: string;

  connection_id?: string;

  previous_account?: string;

  new_account?: string;

  switches_used?: number;

  switch_limit?:
    | number
    | null;

  remaining?:
    | number
    | null;

  unlimited?: boolean;
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
    // CONFIRMATION
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
    // GENERATE KEY FOR REQUESTED ACCOUNT
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
    // ATOMIC SWITCH + LIMIT CHECK
    // ========================================

    const {
      data: rpcData,
      error: switchError,
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


    const switchResult =
      rpcData as
        SwitchRpcResult |
        null;


    if (!switchResult) {
      throw new Error(
        "Advisor account switch returned no result."
      );
    }


    // ========================================
    // LIMIT REACHED
    // ========================================

    if (
      switchResult.success ===
        false &&
      switchResult.code ===
        "SWITCH_LIMIT_REACHED"
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            "SWITCH_LIMIT_REACHED",

          error:
            "You have reached your MetaTrader account switch limit.",

          usage: {
            used:
              switchResult
                .switches_used ??
              0,

            limit:
              switchResult
                .switch_limit ??
              0,

            remaining:
              0,

            unlimited:
              false,
          },
        },
        {
          status: 403,
        }
      );
    }


    // ========================================
    // OTHER RPC ERROR
    // ========================================

    if (
      switchResult.success ===
      false
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            switchResult.code,

          error:
            switchResult.message ??
            "Could not switch MetaTrader account.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // CONNECTION ID
    // ========================================

    const connectionId =
      switchResult
        .connection_id;


    if (!connectionId) {
      throw new Error(
        "Advisor switch returned no connection ID."
      );
    }


    // ========================================
    // LOAD RESULTING CONNECTION
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
          connectionId
        )
        .single();


    if (connectionError) {
      throw new Error(
        `Could not load resulting Advisor connection: ${connectionError.message}`
      );
    }


    // ========================================
    // SUCCESS
    // ========================================

    return NextResponse.json({
      success: true,

      changed:
        switchResult.changed ??
        false,

      previous_account:
        switchResult
          .previous_account ??
        connection.account_number,

      new_account:
        switchResult
          .new_account ??
        connection.account_number,

      advisor_key:
        advisorKey,

      connection,

      usage: {
        used:
          switchResult
            .switches_used ??
          0,

        limit:
          switchResult
            .switch_limit ??
          null,

        remaining:
          switchResult
            .remaining ??
          null,

        unlimited:
          switchResult
            .unlimited ??
          false,
      },

      message:
        switchResult.changed
          ? "MetaTrader account changed successfully."
          : "This MetaTrader account is already connected.",
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