import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  request: NextRequest
) {
  try {
    /*
      GET ELALGO LOGIN TOKEN
    */

    const authorization =
      request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authorization.substring(7);


    /*
      VERIFY USER
    */

    const {
      data: userData,
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );

    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
          error: "Invalid session",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      userData.user;


    /*
      GENERATE ADVISOR SECRET
    */

    const randomSecret =
      crypto
        .randomBytes(32)
        .toString("hex");

    const advisorKey =
      `ela_adv_${randomSecret}`;


    /*
      HASH SECRET
    */

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(advisorKey)
        .digest("hex");


    /*
      SAVE ONLY HASH
    */

    const {
      data: connection,
      error: connectionError,
    } =
      await supabaseAdmin
        .from("advisor_connections")
        .insert({
          user_id: user.id,

          token_hash:
            tokenHash,

          token_prefix:
            advisorKey.substring(
              0,
              12
            ),

          status: "active",
        })
        .select(`
          id,
          token_prefix,
          status,
          created_at
        `)
        .single();

    if (
      connectionError ||
      !connection
    ) {
      console.error(
        "Advisor connection creation error:",
        connectionError
      );

      return NextResponse.json(
        {
          error:
            "Could not create Advisor connection.",
        },
        {
          status: 500,
        }
      );
    }


    /*
      THIS IS THE ONLY TIME
      THE FULL SECRET IS RETURNED.
    */

    return NextResponse.json({
      connection,
      advisor_key:
        advisorKey,
    });

  } catch (error) {
    console.error(
      "Advisor connection API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}