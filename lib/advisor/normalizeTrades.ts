import { supabaseAdmin } from "@/lib/supabaseAdmin";


type RawDeal = {
  deal_ticket: string;

  position_id: string | null;

  position_by_id: string | null;

  symbol: string | null;

  deal_type: string;

  entry_type: string | null;

  volume: number | string;

  price: number | string;

  stop_loss: number | string | null;

  take_profit: number | string | null;

  profit: number | string;

  commission: number | string;

  swap: number | string;

  fee: number | string;

  magic_number:
    number | string | null;

  comment: string | null;

  deal_reason: string | null;

  deal_time: string;

  deal_time_msc:
    number | string;
};


type NormalizeResult = {
  rawDeals: number;

  positionsFound: number;

  normalizedTrades: number;

  openPositionsSkipped: number;

  reversalPositionsSkipped: number;

  invalidPositionsSkipped: number;
};


function numberValue(
  value:
    | number
    | string
    | null
    | undefined
) {
  const result =
    Number(value ?? 0);

  return Number.isFinite(result)
    ? result
    : 0;
}


function weightedPrice(
  deals: RawDeal[]
) {
  let totalVolume = 0;

  let weightedTotal = 0;

  for (const deal of deals) {
    const volume =
      numberValue(
        deal.volume
      );

    const price =
      numberValue(
        deal.price
      );

    totalVolume +=
      volume;

    weightedTotal +=
      volume * price;
  }

  if (totalVolume <= 0) {
    return 0;
  }

  return (
    weightedTotal /
    totalVolume
  );
}


function firstMeaningfulPrice(
  deals: RawDeal[],
  field:
    | "stop_loss"
    | "take_profit"
) {
  for (const deal of deals) {
    const value =
      numberValue(
        deal[field]
      );

    if (
      Math.abs(value) >
      0.0000000001
    ) {
      return value;
    }
  }

  return null;
}


async function loadAllDeals(
  connectionId: string
) {
  const pageSize =
    1000;

  let offset =
    0;

  const allDeals:
    RawDeal[] = [];


  while (true) {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "advisor_deals"
        )
        .select(`
          deal_ticket,
          position_id,
          position_by_id,
          symbol,
          deal_type,
          entry_type,
          volume,
          price,
          stop_loss,
          take_profit,
          profit,
          commission,
          swap,
          fee,
          magic_number,
          comment,
          deal_reason,
          deal_time,
          deal_time_msc
        `)
        .eq(
          "connection_id",
          connectionId
        )
        .order(
          "deal_time_msc",
          {
            ascending: true,
          }
        )
        .range(
          offset,
          offset +
            pageSize -
            1
        );


    if (error) {
      throw new Error(
        `Could not load Advisor deals: ${error.message}`
      );
    }


    const page =
      (data ?? []) as RawDeal[];


    allDeals.push(
      ...page
    );


    if (
      page.length <
      pageSize
    ) {
      break;
    }


    offset +=
      pageSize;
  }


  return allDeals;
}


export async function normalizeAdvisorTrades(
  connectionId: string,
  userId: string,
  platform: "mt4" | "mt5"
): Promise<NormalizeResult> {

  // =========================================
  // LOAD RAW SOURCE DATA
  // =========================================

  const rawDeals =
    await loadAllDeals(
      connectionId
    );


  // =========================================
  // GROUP DEALS BY POSITION
  // =========================================

  const positions =
    new Map<
      string,
      RawDeal[]
    >();


  for (
    const deal of rawDeals
  ) {
    /*
      Ignore balance operations,
      deposits, credits, etc.

      Only BUY / SELL deals belong
      to actual trading positions.
    */

    if (
      deal.deal_type !== "buy" &&
      deal.deal_type !== "sell"
    ) {
      continue;
    }


    if (
      !deal.position_id ||
      deal.position_id === "0"
    ) {
      continue;
    }


    const existing =
      positions.get(
        deal.position_id
      );


    if (existing) {
      existing.push(
        deal
      );
    } else {
      positions.set(
        deal.position_id,
        [deal]
      );
    }
  }


  // =========================================
  // NORMALIZE POSITIONS
  // =========================================

  const normalizedRows:
    Record<string, unknown>[] =
      [];


  let openPositionsSkipped =
    0;

  let reversalPositionsSkipped =
    0;

  let invalidPositionsSkipped =
    0;


  const epsilon =
    0.00000001;


  for (
    const [
      positionId,
      deals,
    ] of positions
  ) {

    // ---------------------------------------
    // ORDER DEALS
    // ---------------------------------------

    deals.sort(
      (a, b) =>
        numberValue(
          a.deal_time_msc
        ) -
        numberValue(
          b.deal_time_msc
        )
    );


    // ---------------------------------------
    // REVERSALS
    // ---------------------------------------

    const hasReversal =
      deals.some(
        (deal) =>
          deal.entry_type ===
          "inout"
      );


    /*
      Your current dataset has zero
      INOUT deals.

      We deliberately do not pretend
      to support netting reversals yet.
    */

    if (hasReversal) {
      reversalPositionsSkipped++;
      continue;
    }


    // ---------------------------------------
    // ENTRY / EXIT DEALS
    // ---------------------------------------

    const entries =
      deals.filter(
        (deal) =>
          deal.entry_type ===
          "in"
      );


    const exits =
      deals.filter(
        (deal) =>
          deal.entry_type ===
            "out" ||
          deal.entry_type ===
            "out_by"
      );


    if (
      entries.length === 0
    ) {
      invalidPositionsSkipped++;
      continue;
    }


    if (
      exits.length === 0
    ) {
      /*
        Most likely a position that
        is still open.
      */

      openPositionsSkipped++;
      continue;
    }


    // ---------------------------------------
    // ENTRY DIRECTION
    // ---------------------------------------

    const entryTypes =
      new Set(
        entries.map(
          (deal) =>
            deal.deal_type
        )
      );


    /*
      For normal hedging positions,
      all entry deals should point in
      the same direction.
    */

    if (
      entryTypes.size !== 1
    ) {
      invalidPositionsSkipped++;
      continue;
    }


    const direction =
      entries[0]
        .deal_type;


    if (
      direction !== "buy" &&
      direction !== "sell"
    ) {
      invalidPositionsSkipped++;
      continue;
    }


    // ---------------------------------------
    // VOLUME
    // ---------------------------------------

    const entryVolume =
      entries.reduce(
        (total, deal) =>
          total +
          numberValue(
            deal.volume
          ),
        0
      );


    const exitVolume =
      exits.reduce(
        (total, deal) =>
          total +
          numberValue(
            deal.volume
          ),
        0
      );


    if (
      entryVolume <=
      epsilon
    ) {
      invalidPositionsSkipped++;
      continue;
    }


    /*
      Entry volume greater than exit
      volume means the position is
      still partially open.
    */

    if (
      exitVolume +
        epsilon <
      entryVolume
    ) {
      openPositionsSkipped++;
      continue;
    }


    // ---------------------------------------
    // PRICES
    // ---------------------------------------

    const openPrice =
      weightedPrice(
        entries
      );


    const closePrice =
      weightedPrice(
        exits
      );


    // ---------------------------------------
    // TIMES
    // ---------------------------------------

    const firstEntry =
      entries[0];


    const lastExit =
      exits[
        exits.length - 1
      ];


    // ---------------------------------------
    // MONEY
    // ---------------------------------------

    const profit =
      deals.reduce(
        (total, deal) =>
          total +
          numberValue(
            deal.profit
          ),
        0
      );


    /*
      Commission may be charged at
      entry, exit, or both.

      So we sum ALL deals belonging
      to the position.
    */

    const commission =
      deals.reduce(
        (total, deal) =>
          total +
          numberValue(
            deal.commission
          ),
        0
      );


    const swap =
      deals.reduce(
        (total, deal) =>
          total +
          numberValue(
            deal.swap
          ),
        0
      );


    const fee =
      deals.reduce(
        (total, deal) =>
          total +
          numberValue(
            deal.fee
          ),
        0
      );


    // ---------------------------------------
    // SL / TP
    // ---------------------------------------

    const stopLoss =
      firstMeaningfulPrice(
        entries,
        "stop_loss"
      );


    const takeProfit =
      firstMeaningfulPrice(
        entries,
        "take_profit"
      );


    // ---------------------------------------
    // MAGIC / COMMENT
    // ---------------------------------------

    const firstEntryWithComment =
      entries.find(
        (deal) =>
          Boolean(
            deal.comment?.trim()
          )
      );


    const firstEntryWithMagic =
      entries.find(
        (deal) =>
          numberValue(
            deal.magic_number
          ) !== 0
      );


    // ---------------------------------------
    // NORMALIZED TRADE
    // ---------------------------------------

    normalizedRows.push({
      connection_id:
        connectionId,

      user_id:
        userId,

      platform,

      external_trade_id:
        positionId,

      symbol:
        firstEntry.symbol ??
        "",

      direction,

      volume:
        entryVolume,

      open_time:
        firstEntry.deal_time,

      close_time:
        lastExit.deal_time,

      open_price:
        openPrice,

      close_price:
        closePrice,

      stop_loss:
        stopLoss,

      take_profit:
        takeProfit,

      profit,

      commission,

      swap,

      fee,

      magic_number:
        firstEntryWithMagic
          ?.magic_number ??
        firstEntry
          .magic_number ??
        null,

      comment:
        firstEntryWithComment
          ?.comment ??
        firstEntry
          .comment ??
        null,

      updated_at:
        new Date()
          .toISOString(),
    });
  }


  // =========================================
  // REBUILD DERIVED TABLE
  // =========================================

  /*
    advisor_deals = raw truth

    advisor_trades = derived dataset

    So it is safe to completely rebuild
    normalized trades for this connection.
  */

  const {
    error: deleteError,
  } =
    await supabaseAdmin
      .from(
        "advisor_trades"
      )
      .delete()
      .eq(
        "connection_id",
        connectionId
      );


  if (deleteError) {
    throw new Error(
      `Could not clear normalized trades: ${deleteError.message}`
    );
  }


  // =========================================
  // INSERT IN BATCHES
  // =========================================

  const insertBatchSize =
    200;


  for (
    let index = 0;
    index <
    normalizedRows.length;
    index +=
    insertBatchSize
  ) {
    const batch =
      normalizedRows.slice(
        index,
        index +
          insertBatchSize
      );


    const {
      error,
    } =
      await supabaseAdmin
        .from(
          "advisor_trades"
        )
        .insert(
          batch
        );


    if (error) {
      throw new Error(
        `Could not create normalized trades: ${error.message}`
      );
    }
  }


  return {
    rawDeals:
      rawDeals.length,

    positionsFound:
      positions.size,

    normalizedTrades:
      normalizedRows.length,

    openPositionsSkipped,

    reversalPositionsSkipped,

    invalidPositionsSkipped,
  };
}