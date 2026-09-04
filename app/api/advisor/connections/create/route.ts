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
    // AUTHENTICATE WEBSITE USER
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


    // Only digits.
    if (
      !/^\d+$/.test(
        accountNumber
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid MetaTrader account number.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // LOOK FOR EXISTING ACTIVE CONNECTION
    // ========================================

    const {
      data:
        existingConnection,
      error:
        existingError,
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
      /*
        Rebuild the exact same key.

        Same:
        user_id
        +
        account_number
        +
        server secret

        =
        exact same Advisor key.
      */

      const advisorKey =
        generateStableAdvisorKey(
          user.id,
          accountNumber
        );


      const tokenHash =
        hashAdvisorKey(
          advisorKey
        );


      /*
        Ensure database hash matches
        our deterministic key.

        This also smoothly upgrades an
        older random-key connection.
      */

      const tokenPrefix =
        advisorKey.slice(
          0,
          18
        );


      const {
        data:
          updatedConnection,
        error:
          updateError,
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
            last_deal_time_msc,
            last_sync_at,
            last_connected_at,
            created_at
          `)
          .single();


      if (updateError) {
        throw new Error(
          `Could not update Advisor key: ${updateError.message}`
        );
      }


      return NextResponse.json({
        success: true,

        existing: true,

        advisor_key:
          advisorKey,

        connection:
          updatedConnection,

        message:
          "Existing Advisor connection restored.",
      });
    }


    // ========================================
    // DIFFERENT ACCOUNT ALREADY EXISTS
    // ========================================

    if (
      existingConnection &&
      String(
        existingConnection
          .account_number
      ) !==
        accountNumber
    ) {
      /*
        DO NOT delete anything here.

        Account replacement will have
        its own explicit endpoint in
        the next step.
      */

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
    // FIRST CONNECTION FOR THIS USER
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


    // ========================================
    // RETURN FULL KEY
    // ========================================

    return NextResponse.json({
      success: true,

      existing: false,

      advisor_key:
        advisorKey,

      connection,

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