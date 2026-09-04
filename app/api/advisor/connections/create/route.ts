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


type CreateConnectionBody = {
  account_number?: string;
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
    // INITIALIZE ADVISOR USAGE
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
    // READ BODY
    // ========================================

    let body:
      CreateConnectionBody;


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
            "MetaTrader account number is required.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      !/^\d+$/.test(
        accountNumber
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
    // GENERATE STABLE KEY
    // ========================================

    const advisorKey =
      generateStableAdvisorKey(
        user.id,
        accountNumber
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
    // CHECK EXISTING CONNECTION
    // ========================================

    const {
      data: existingConnection,
      error: existingError,
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


    if (existingError) {
      throw new Error(
        `Could not inspect Advisor connection: ${existingError.message}`
      );
    }


    // ========================================
    // SAME ACCOUNT ALREADY EXISTS
    // ========================================

    if (
      existingConnection &&
      String(
        existingConnection
          .account_number
      ) ===
        accountNumber
    ) {

      const {
        data: updatedConnection,
        error: updateError,
      } =
        await supabaseAdmin
          .from(
            "advisor_connections"
          )
          .update({
            token_hash:
              tokenHash,

            token_prefix:
              tokenPrefix,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            "id",
            existingConnection.id
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
          .single();


      if (updateError) {
        throw new Error(
          `Could not restore Advisor connection: ${updateError.message}`
        );
      }


      const usage =
        await loadUsage(
          user.id
        );


      return NextResponse.json({
        success: true,

        existing: true,

        advisor_key:
          advisorKey,

        connection:
          updatedConnection,

        usage,

        message:
          "Existing Advisor connection restored.",
      });
    }


    // ========================================
    // DIFFERENT ACCOUNT EXISTS
    // ========================================

    if (existingConnection) {

      return NextResponse.json(
        {
          success: false,

          account_change:
            true,

          current_account:
            existingConnection
              .account_number,

          requested_account:
            accountNumber,

          error:
            "A different MetaTrader account is already connected.",
        },
        {
          status: 409,
        }
      );
    }


    // ========================================
    // CREATE FIRST CONNECTION
    // ========================================

    const {
      data: connection,
      error: insertError,
    } =
      await supabaseAdmin
        .from(
          "advisor_connections"
        )
        .insert({
          user_id:
            user.id,

          account_number:
            accountNumber,

          token_hash:
            tokenHash,

          token_prefix:
            tokenPrefix,

          status:
            "active",

          last_deal_time_msc:
            0,
        })
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
        .single();


    if (insertError) {
      throw new Error(
        `Could not create Advisor connection: ${insertError.message}`
      );
    }


    const usage =
      await loadUsage(
        user.id
      );


    return NextResponse.json({
      success: true,

      existing: false,

      advisor_key:
        advisorKey,

      connection,

      usage,

      message:
        "Advisor connection created successfully.",
    });

  } catch (error) {

    console.error(
      "Create Advisor connection error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not create Advisor connection.",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// LOAD USAGE
// ==========================================

async function loadUsage(
  userId: string
) {

  const {
    data,
    error,
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
        userId
      )
      .single();


  if (error) {
    throw new Error(
      `Could not load Advisor usage: ${error.message}`
    );
  }


  const used =
    data.account_switches_used ??
    0;


  const unlimited =
    data.account_switch_limit ===
    null;


  const limit =
    unlimited
      ? null
      : (
          data.account_switch_limit ??
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


  return {
    used,
    limit,
    remaining,
    unlimited,
  };
}