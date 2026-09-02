import {
  NextRequest,
  NextResponse,
} from "next/server";

import { authenticateAdvisorKey } from "@/lib/advisor/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


type AdvisorDeal = {
  deal_ticket: string;

  position_id?: string | null;

  order_ticket?: string | null;

  symbol?: string | null;

  deal_type: string;

  entry_type?: string | null;

  volume: number;

  price: number;

  stop_loss?: number | null;

  take_profit?: number | null;

  profit: number;

  commission: number;

  swap: number;

  fee: number;

  magic_number?: number | null;

  comment?: string | null;

  deal_time_msc: string;
};


type SyncBody = {
  account_number?: string;

  platform?: string;

  agent_version?: string;

  balance?: number;

  equity?: number;

  deals?: AdvisorDeal[];
};


export async function POST(
  request: NextRequest
) {
  try {

    // ========================================
    // AUTHENTICATE ADVISOR
    // ========================================

    const connection =
      await authenticateAdvisorKey(
        request.headers.get(
          "authorization"
        )
      );


    if (!connection) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or revoked Advisor key.",
        },
        {
          status: 401,
        }
      );
    }


    // ========================================
    // READ BODY
    // ========================================

    let body: SyncBody;

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
      body.account_number?.trim();


    if (!accountNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Account number is required.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // VERIFY ACCOUNT BINDING
    // ========================================

    if (
      String(
        connection.account_number
      ) !== accountNumber
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Advisor key does not belong to this MetaTrader account.",
        },
        {
          status: 409,
        }
      );
    }


    if (
      connection.platform !==
      body.platform
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Advisor platform does not match the connected account.",
        },
        {
          status: 409,
        }
      );
    }


    // ========================================
    // VALIDATE DEALS
    // ========================================

    const deals =
      body.deals ?? [];


    /*
      We batch from MetaTrader.

      This protects the API from gigantic
      individual requests.
    */

    if (deals.length > 250) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Maximum 250 deals per synchronization request.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // FIND EXISTING DEALS
    // ========================================



    // ========================================
    // NORMALIZE DATABASE ROWS
    // ========================================

    const rows =
      deals.map((deal) => {

        const timeMsc =
          Number(
            deal.deal_time_msc
          );


        if (
          !Number.isFinite(
            timeMsc
          )
        ) {
          throw new Error(
            `Invalid deal_time_msc for deal ${deal.deal_ticket}`
          );
        }


        return {
          connection_id:
            connection.id,

          user_id:
            connection.user_id,

          deal_ticket:
            deal.deal_ticket,

          position_id:
            deal.position_id ??
            null,

          order_ticket:
            deal.order_ticket ??
            null,

          symbol:
            deal.symbol ??
            null,

          deal_type:
            deal.deal_type,

          entry_type:
            deal.entry_type ??
            null,

          volume:
            deal.volume,

          price:
            deal.price,

          stop_loss:
            deal.stop_loss ??
            null,

          take_profit:
            deal.take_profit ??
            null,

          profit:
            deal.profit,

          commission:
            deal.commission,

          swap:
            deal.swap,

          fee:
            deal.fee,

          magic_number:
            deal.magic_number ??
            null,

          comment:
            deal.comment ??
            null,

          deal_time:
            new Date(
              timeMsc
            ).toISOString(),

          deal_time_msc:
            deal.deal_time_msc,

          updated_at:
            new Date()
              .toISOString(),
        };
      });


    // ========================================
    // UPSERT DEALS
    // ========================================

    if (rows.length > 0) {
      const {
        error: upsertError,
      } =
        await supabaseAdmin
          .from("advisor_deals")
          .upsert(
            rows,
            {
              onConflict:
                "connection_id,deal_ticket",
            }
          );


      if (upsertError) {
        console.error(
          "Advisor deal upsert error:",
          upsertError
        );

        return NextResponse.json(
          {
            success: false,

            error:
              "Could not synchronize Advisor deals.",
          },
          {
            status: 500,
          }
        );
      }
    }


    // ========================================
    // CALCULATE COUNTS
    // ========================================

    const processedRecords =
        deals.length;
    // ========================================
    // LATEST DEAL CURSOR
    // ========================================

    let latestDealTimeMsc =
      Number(
        connection.last_deal_time_msc ??
        0
      );


    for (
      const deal of deals
    ) {
      const time =
        Number(
          deal.deal_time_msc
        );

      if (
        time >
        latestDealTimeMsc
      ) {
        latestDealTimeMsc =
          time;
      }
    }


    // ========================================
    // UPDATE CONNECTION
    // ========================================

    const now =
      new Date()
        .toISOString();


    const {
      error: connectionUpdateError,
    } =
      await supabaseAdmin
        .from(
          "advisor_connections"
        )
        .update({
          last_balance:
            body.balance ??
            null,

          last_equity:
            body.equity ??
            null,

          last_sync_at:
            now,

          last_deal_time_msc:
            latestDealTimeMsc,

          updated_at:
            now,
        })
        .eq(
          "id",
          connection.id
        );


    if (
      connectionUpdateError
    ) {
      console.error(
        "Advisor connection sync update error:",
        connectionUpdateError
      );
    }


    // ========================================
    // SAVE SYNC SESSION
    // ========================================

    const {
      error: sessionError,
    } =
      await supabaseAdmin
        .from(
          "advisor_sync_sessions"
        )
        .insert({
          connection_id:
            connection.id,

          user_id:
            connection.user_id,

          agent_version:
            body.agent_version ??
            null,

          platform:
            body.platform ??
            null,

          account_number:
            accountNumber,

          received_records:
            processedRecords,

          inserted_records:
            0,

          updated_records:
            0,

          sync_status:
            "success",

          completed_at:
            now,
        });


    if (sessionError) {
      console.error(
        "Advisor sync session error:",
        sessionError
      );
    }


    // ========================================
    // SUCCESS
    // ========================================

    return NextResponse.json({
      success: true,

      received:
        processedRecords,

      inserted:
        0,

      updated:
        0,

      latest_deal_time_msc:
        String(
          latestDealTimeMsc
        ),
    });

  } catch (error) {

    console.error(
      "Advisor synchronization API error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        error:
          "Internal synchronization error.",
      },
      {
        status: 500,
      }
    );
  }
}