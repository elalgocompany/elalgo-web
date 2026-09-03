import crypto from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  supabaseAdmin,
} from "@/lib/supabaseAdmin";


function hashAdvisorKey(
  key: string
) {
  return crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");
}


export async function POST(
  request: NextRequest
) {
  try {
    // ========================================
    // AUTH
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


    // ========================================
    // FIND EXISTING CONNECTION
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
          last_deal_time_msc
        `)
        .eq(
          "user_id",
          userData.user.id
        )
        .eq(
          "status",
          "active"
        )
        .limit(1)
        .maybeSingle();


    if (connectionError) {
      throw new Error(
        connectionError.message
      );
    }


    if (!connection) {
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


    // ========================================
    // GENERATE NEW SECRET
    // ========================================

    const advisorKey =
      `ela_adv_${crypto
        .randomBytes(32)
        .toString("hex")}`;


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
    // UPDATE SAME CONNECTION
    // ========================================

    const {
      data: updated,
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
          connection.id
        )
        .eq(
          "user_id",
          userData.user.id
        )
        .select(`
          id,
          token_prefix,
          account_number,
          platform,
          last_deal_time_msc
        `)
        .single();


    if (updateError) {
      throw new Error(
        updateError.message
      );
    }


    // ========================================
    // IMPORTANT:
    //
    // We DID NOT change:
    //
    // connection.id
    // account_number
    // platform
    // last_deal_time_msc
    //
    // ========================================


    return NextResponse.json({
      success: true,

      advisor_key:
        advisorKey,

      connection:
        updated,

      message:
        "Advisor key rotated successfully.",
    });

  } catch (error) {
    console.error(
      "Advisor key rotation error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not rotate Advisor key.",
      },
      {
        status: 500,
      }
    );
  }
}