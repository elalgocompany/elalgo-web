import { supabaseAdmin } from "@/lib/supabaseAdmin";


type RawDeal = {
  deal_ticket: string;

  position_id: string | null;

  symbol: string | null;

  deal_type: string;

  entry_type: string | null;

  deal_reason: string | null;

  volume: number | string;

  price: number | string;

  stop_loss:
    number | string | null;

  take_profit:
    number | string | null;

  profit: number | string;

  commission: number | string;

  swap: number | string;

  fee: number | string;

  magic_number:
    number | string | null;

  comment: string | null;

  deal_time: string;

  deal_time_msc:
    number | string;
};


type NormalizeResult = {
  mode:
    | "full"
    | "incremental";

  rawDealsExamined: number;

  affectedPositions: number;

  normalizedTrades: number;

  openPositionsSkipped: number;

  invalidPositionsSkipped: number;
};


function toNumber(
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
  let volumeTotal = 0;
  let priceTotal = 0;

  for (const deal of deals) {
    const volume =
      toNumber(
        deal.volume
      );

    const price =
      toNumber(
        deal.price
      );

    volumeTotal += volume;

    priceTotal +=
      volume * price;
  }

  if (volumeTotal <= 0) {
    return 0;
  }

  return (
    priceTotal /
    volumeTotal
  );
}


function firstNonZeroPrice(
  deals: RawDeal[],
  property:
    | "stop_loss"
    | "take_profit"
) {
  for (const deal of deals) {
    const value =
      toNumber(
        deal[property]
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


// ==========================================
// LOAD ALL RAW DEALS
// ==========================================

async function loadAllDeals(
  connectionId: string
) {
  const pageSize = 1000;

  let offset = 0;

  const result:
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
          symbol,
          deal_type,
          entry_type,
          deal_reason,
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


    result.push(
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


  return result;
}


// ==========================================
// FIND POSITIONS CHANGED SINCE CURSOR
// ==========================================

async function findAffectedPositions(
  connectionId: string,
  sinceDealTimeMsc: number
) {
  /*
    Same philosophy as our EA sync.

    Slight overlap protects us from
    timestamp boundaries.
  */

  const from =
    Math.max(
      0,
      sinceDealTimeMsc -
        2000
    );


  const pageSize = 1000;

  let offset = 0;

  const positionIds =
    new Set<string>();


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
          position_id,
          deal_type
        `)
        .eq(
          "connection_id",
          connectionId
        )
        .gte(
          "deal_time_msc",
          String(from)
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
        `Could not find affected Advisor positions: ${error.message}`
      );
    }


    const page =
      data ?? [];


    for (
      const deal of page
    ) {
      if (
        deal.deal_type !==
          "buy" &&
        deal.deal_type !==
          "sell"
      ) {
        continue;
      }


      if (
        deal.position_id &&
        deal.position_id !==
          "0"
      ) {
        positionIds.add(
          deal.position_id
        );
      }
    }


    if (
      page.length <
      pageSize
    ) {
      break;
    }


    offset +=
      pageSize;
  }


  return Array.from(
    positionIds
  );
}


// ==========================================
// LOAD DEALS FOR SPECIFIC POSITIONS
// ==========================================

async function loadPositionDeals(
  connectionId: string,
  positionIds: string[]
) {
  const allDeals:
    RawDeal[] = [];


  /*
    Avoid giant IN() queries.
  */

  const idBatchSize =
    100;


  for (
    let index = 0;
    index <
    positionIds.length;
    index +=
    idBatchSize
  ) {
    const ids =
      positionIds.slice(
        index,
        index +
          idBatchSize
      );


    let offset = 0;

    const pageSize =
      1000;


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
            symbol,
            deal_type,
            entry_type,
            deal_reason,
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
            deal_time,
            deal_time_msc
          `)
          .eq(
            "connection_id",
            connectionId
          )
          .in(
            "position_id",
            ids
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
          `Could not load position deals: ${error.message}`
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
  }


  return allDeals;
}


// ==========================================
// MAIN NORMALIZER
// ==========================================

export async function normalizeAdvisorTrades(
  connectionId: string,
  userId: string,
  platform:
    | "mt4"
    | "mt5",
  sinceDealTimeMsc: number
): Promise<NormalizeResult> {

  // ========================================
  // CHECK IF THIS IS OUR FIRST NORMALIZATION
  // ========================================

  const {
    count: existingTradeCount,
    error: countError,
  } =
    await supabaseAdmin
      .from(
        "advisor_trades"
      )
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "connection_id",
        connectionId
      );


  if (countError) {
    throw new Error(
      `Could not inspect normalized trades: ${countError.message}`
    );
  }


  const fullNormalization =
    !existingTradeCount ||
    existingTradeCount === 0;


  let rawDeals:
    RawDeal[];


  let mode:
    "full" |
    "incremental";


  // ========================================
  // FIRST RUN
  // ========================================

  if (fullNormalization) {
    mode =
      "full";


    rawDeals =
      await loadAllDeals(
        connectionId
      );
  }

  // ========================================
  // LATER RUNS
  // ========================================

  else {
    mode =
      "incremental";


    const affectedPositionIds =
      await findAffectedPositions(
        connectionId,
        sinceDealTimeMsc
      );


    if (
      affectedPositionIds.length ===
      0
    ) {
      return {
        mode,

        rawDealsExamined: 0,

        affectedPositions: 0,

        normalizedTrades: 0,

        openPositionsSkipped: 0,

        invalidPositionsSkipped: 0,
      };
    }


    rawDeals =
      await loadPositionDeals(
        connectionId,
        affectedPositionIds
      );
  }


  // ========================================
  // GROUP BY POSITION
  // ========================================

  const positionMap =
    new Map<
      string,
      RawDeal[]
    >();


  for (
    const deal of rawDeals
  ) {
    /*
      Ignore deposits, credits,
      standalone commissions etc.
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
      positionMap.get(
        deal.position_id
      );


    if (existing) {
      existing.push(
        deal
      );
    } else {
      positionMap.set(
        deal.position_id,
        [deal]
      );
    }
  }


  const normalizedRows:
    Record<string, unknown>[] =
      [];


  let openPositionsSkipped =
    0;

  let invalidPositionsSkipped =
    0;


  const epsilon =
    0.00000001;


  // ========================================
  // NORMALIZE EACH POSITION
  // ========================================

  for (
    const [
      positionId,
      deals,
    ] of positionMap
  ) {

    deals.sort(
      (a, b) =>
        toNumber(
          a.deal_time_msc
        ) -
        toNumber(
          b.deal_time_msc
        )
    );


    // --------------------------------------
    // REVERSAL PROTECTION
    // --------------------------------------

    if (
      deals.some(
        (deal) =>
          deal.entry_type ===
          "inout"
      )
    ) {
      /*
        We will explicitly support
        netting reversals later.

        Your current test history showed
        no INOUT deals.
      */

      invalidPositionsSkipped++;

      continue;
    }


    // --------------------------------------
    // ENTRY DEALS
    // --------------------------------------

    const entries =
      deals.filter(
        (deal) =>
          deal.entry_type ===
          "in"
      );


    // --------------------------------------
    // EXIT DEALS
    // --------------------------------------

    const exits =
      deals.filter(
        (deal) =>
          deal.entry_type ===
            "out" ||
          deal.entry_type ===
            "out_by"
      );


    if (
      entries.length ===
      0
    ) {
      invalidPositionsSkipped++;

      continue;
    }


    /*
      No exits means the position
      hasn't been closed.
    */

    if (
      exits.length ===
      0
    ) {
      openPositionsSkipped++;

      continue;
    }


    // --------------------------------------
    // DIRECTION
    // --------------------------------------

    const entryDirections =
      new Set(
        entries.map(
          (deal) =>
            deal.deal_type
        )
      );


    if (
      entryDirections.size !==
      1
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


    // --------------------------------------
    // VOLUME
    // --------------------------------------

    const entryVolume =
      entries.reduce(
        (total, deal) =>
          total +
          toNumber(
            deal.volume
          ),
        0
      );


    const exitVolume =
      exits.reduce(
        (total, deal) =>
          total +
          toNumber(
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
      Example:

      entered 1.00
      exited 0.40

      Position still has 0.60 open.

      Do NOT create a completed trade.
    */

    if (
      exitVolume +
        epsilon <
      entryVolume
    ) {
      openPositionsSkipped++;

      continue;
    }


    /*
      Exit volume significantly larger
      than entry volume means something
      unusual happened that our current
      V1 normalizer doesn't understand.
    */

    if (
      exitVolume >
      entryVolume +
        epsilon
    ) {
      invalidPositionsSkipped++;

      continue;
    }


    // --------------------------------------
    // PRICE
    // --------------------------------------

    const openPrice =
      weightedPrice(
        entries
      );


    const closePrice =
      weightedPrice(
        exits
      );


    // --------------------------------------
    // TIMES
    // --------------------------------------

    const firstEntry =
      entries[0];


    const finalExit =
      exits[
        exits.length - 1
      ];


    const openTimeMs =
      toNumber(
        firstEntry.deal_time_msc
      );


    const closeTimeMs =
      toNumber(
        finalExit.deal_time_msc
      );


    const durationSeconds =
      Math.max(
        0,

        Math.floor(
          (
            closeTimeMs -
            openTimeMs
          ) /
          1000
        )
      );


    // --------------------------------------
    // MONEY
    // --------------------------------------

    const profit =
      deals.reduce(
        (total, deal) =>
          total +
          toNumber(
            deal.profit
          ),
        0
      );


    const commission =
      deals.reduce(
        (total, deal) =>
          total +
          toNumber(
            deal.commission
          ),
        0
      );


    const swap =
      deals.reduce(
        (total, deal) =>
          total +
          toNumber(
            deal.swap
          ),
        0
      );


    const fee =
      deals.reduce(
        (total, deal) =>
          total +
          toNumber(
            deal.fee
          ),
        0
      );


    const netProfit =
      profit +
      commission +
      swap +
      fee;


    // --------------------------------------
    // SL / TP
    // --------------------------------------

    const stopLoss =
      firstNonZeroPrice(
        entries,
        "stop_loss"
      );


    const takeProfit =
      firstNonZeroPrice(
        entries,
        "take_profit"
      );


    // --------------------------------------
    // MAGIC
    // --------------------------------------

    const magicDeal =
      entries.find(
        (deal) =>
          toNumber(
            deal.magic_number
          ) !== 0
      );


    // --------------------------------------
    // COMMENT
    // --------------------------------------

    const commentDeal =
      entries.find(
        (deal) =>
          Boolean(
            deal.comment
              ?.trim()
          )
      );


    // --------------------------------------
    // CREATE NORMALIZED TRADE
    // --------------------------------------

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
        finalExit.deal_time,

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

      net_profit:
        netProfit,

      duration_seconds:
        durationSeconds,

      entry_deals_count:
        entries.length,

      exit_deals_count:
        exits.length,

      partial_close:
        exits.length > 1,

      close_reason:
        finalExit.deal_reason ??
        null,

      magic_number:
        magicDeal
          ?.magic_number ??
        firstEntry
          .magic_number ??
        null,

      comment:
        commentDeal
          ?.comment ??
        firstEntry
          .comment ??
        null,

      updated_at:
        new Date()
          .toISOString(),
    });
  }


  // ========================================
  // FIRST RUN: CLEAN DERIVED TABLE
  // ========================================

  if (fullNormalization) {
    const {
      error,
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


    if (error) {
      throw new Error(
        `Could not reset normalized trades: ${error.message}`
      );
    }
  }


  // ========================================
  // UPSERT NORMALIZED TRADES
  // ========================================

  const batchSize =
    200;


  for (
    let index = 0;
    index <
    normalizedRows.length;
    index +=
    batchSize
  ) {
    const batch =
      normalizedRows.slice(
        index,
        index +
          batchSize
      );


    const {
      error,
    } =
      await supabaseAdmin
        .from(
          "advisor_trades"
        )
        .upsert(
          batch,
          {
            onConflict:
              "connection_id,external_trade_id",
          }
        );


    if (error) {
      throw new Error(
        `Could not save normalized Advisor trades: ${error.message}`
      );
    }
  }


  return {
    mode,

    rawDealsExamined:
      rawDeals.length,

    affectedPositions:
      positionMap.size,

    normalizedTrades:
      normalizedRows.length,

    openPositionsSkipped,

    invalidPositionsSkipped,
  };
}