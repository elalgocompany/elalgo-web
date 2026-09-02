import {
  NextRequest,
  NextResponse,
} from "next/server";

import { authenticateAdvisorKey } from "@/lib/advisor/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ConnectBody = {
  account_number?: string;
  platform?: string;
  broker?: string;
  server?: string;
  currency?: string;
  leverage?: number;
  balance?: number;
  equity?: number;
  agent_version?: string;
};

export async function POST(
  request: NextRequest
) {
  try {
    // -----------------------------------------
    // AUTHENTICATE ADVISOR KEY
    // -----------------------------------------

    const connection =
      await authenticateAdvisorKey(
        request.headers.get(
          "authorization"
        )
      );

    if (!connection) {
      return NextResponse.json(
        {
          connected: false,
          error:
            "Invalid or revoked Advisor key.",
        },
        {
          status: 401,
        }
      );
    }


    // -----------------------------------------
    // READ BODY
    // -----------------------------------------

    let body: ConnectBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          connected: false,
          error: "Invalid JSON body.",
        },
        {
          status: 400,
        }
      );
    }


    // -----------------------------------------
    // VALIDATE ACCOUNT
    // -----------------------------------------

    const accountNumber =
      body.account_number?.trim();

    if (!accountNumber) {
      return NextResponse.json(
        {
          connected: false,
          error:
            "MetaTrader account number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.platform !== "mt4" &&
      body.platform !== "mt5"
    ) {
      return NextResponse.json(
        {
          connected: false,
          error:
            "Invalid MetaTrader platform.",
        },
        {
          status: 400,
        }
      );
    }


    // -----------------------------------------
    // CHECK EXISTING BINDING
    // -----------------------------------------

    if (connection.account_number) {
      const existingAccount =
        String(
          connection.account_number
        );

      if (
        existingAccount !==
        accountNumber
      ) {
        return NextResponse.json(
          {
            connected: false,

            error:
              "This Advisor key is already connected to another MetaTrader account.",
          },
          {
            status: 409,
          }
        );
      }
    }


    if (
      connection.platform &&
      connection.platform !==
        body.platform
    ) {
      return NextResponse.json(
        {
          connected: false,

          error:
            "This Advisor connection is already bound to another MetaTrader platform.",
        },
        {
          status: 409,
        }
      );
    }


    // -----------------------------------------
    // BIND / UPDATE ACCOUNT
    // -----------------------------------------

    const {
      data: updatedConnection,
      error: updateError,
    } =
      await supabaseAdmin
        .from(
          "advisor_connections"
        )
        .update({
          account_number:
            accountNumber,

          platform:
            body.platform,

          broker:
            body.broker?.trim() ||
            null,

          server:
            body.server?.trim() ||
            null,

          account_currency:
            body.currency?.trim() ||
            null,

          leverage:
            body.leverage ?? null,

          last_balance:
            body.balance ?? null,

          last_equity:
            body.equity ?? null,

          last_connected_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          connection.id
        )
        .eq(
          "status",
          "active"
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
          last_connected_at
        `)
        .single();


    if (
      updateError ||
      !updatedConnection
    ) {
      console.error(
        "Advisor connection update error:",
        updateError
      );

      return NextResponse.json(
        {
          connected: false,

          error:
            "Could not bind Advisor account.",
        },
        {
          status: 500,
        }
      );
    }


    // -----------------------------------------
    // SUCCESS
    // -----------------------------------------

    return NextResponse.json({
      connected: true,

      connection_id:
        updatedConnection.id,

      account_number:
        updatedConnection.account_number,

      platform:
        updatedConnection.platform,

      message:
        "ElAlgo Advisor connected successfully.",
    });

  } catch (error) {
    console.error(
      "Advisor connect API error:",
      error
    );

    return NextResponse.json(
      {
        connected: false,

        error:
          "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}