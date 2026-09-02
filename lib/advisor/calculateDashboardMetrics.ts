export type AdvisorDashboardRange =
  | "1d"
  | "1w"
  | "1m"
  | "3m"
  | "6m"
  | "1y"
  | "all";


type TradeRow = {
  external_trade_id: string;

  symbol: string;

  close_time: string;

  net_profit:
    | number
    | string
    | null;
};


type PerformancePoint = {
  trade: number;

  time: string;

  pnl: number;

  cumulative: number;
};


type SymbolResult = {
  symbol: string;

  trades: number;

  netProfit: number;

  winRate: number;

  profitFactor: number | null;
};


import {
  supabaseAdmin,
} from "@/lib/supabaseAdmin";


// ==========================================
// NUMBER HELPERS
// ==========================================

function toNumber(
  value:
    | number
    | string
    | null
    | undefined
) {
  const result =
    Number(
      value ?? 0
    );


  return Number.isFinite(
    result
  )
    ? result
    : 0;
}


function round(
  value: number,
  decimals = 4
) {
  const multiplier =
    Math.pow(
      10,
      decimals
    );


  return (
    Math.round(
      value *
      multiplier
    ) /
    multiplier
  );
}


// ==========================================
// RANGE VALIDATION
// ==========================================

export function isAdvisorDashboardRange(
  value: string
): value is AdvisorDashboardRange {

  return [
    "1d",
    "1w",
    "1m",
    "3m",
    "6m",
    "1y",
    "all",
  ].includes(
    value
  );
}


// ==========================================
// RANGE START
// ==========================================

function getRangeStart(
  range: AdvisorDashboardRange
) {
  if (
    range === "all"
  ) {
    return null;
  }


  const start =
    new Date();


  switch (range) {

    case "1d":

      start.setUTCDate(
        start.getUTCDate() -
        1
      );

      break;


    case "1w":

      start.setUTCDate(
        start.getUTCDate() -
        7
      );

      break;


    case "1m":

      start.setUTCMonth(
        start.getUTCMonth() -
        1
      );

      break;


    case "3m":

      start.setUTCMonth(
        start.getUTCMonth() -
        3
      );

      break;


    case "6m":

      start.setUTCMonth(
        start.getUTCMonth() -
        6
      );

      break;


    case "1y":

      start.setUTCFullYear(
        start.getUTCFullYear() -
        1
      );

      break;
  }


  return start;
}


// ==========================================
// LOAD NORMALIZED TRADES
// ==========================================

async function loadTrades(
  connectionId: string,
  range: AdvisorDashboardRange
) {
  const pageSize =
    1000;


  let offset =
    0;


  const trades:
    TradeRow[] = [];


  const rangeStart =
    getRangeStart(
      range
    );


  while (true) {

    let query =
      supabaseAdmin
        .from(
          "advisor_trades"
        )
        .select(`
          external_trade_id,
          symbol,
          close_time,
          net_profit
        `)
        .eq(
          "connection_id",
          connectionId
        );


    if (rangeStart) {
      query =
        query.gte(
          "close_time",
          rangeStart
            .toISOString()
        );
    }


    const {
      data,
      error,
    } =
      await query
        .order(
          "close_time",
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
        `Could not load Advisor trades: ${error.message}`
      );
    }


    const page =
      data ?? [];


    for (
      const row of page
    ) {
      trades.push({
        external_trade_id:
          row.external_trade_id,

        symbol:
          row.symbol,

        close_time:
          row.close_time,

        net_profit:
          row.net_profit,
      });
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


  return trades;
}


// ==========================================
// MAX DRAWDOWN
// ==========================================

function calculateMaxDrawdown(
  trades: TradeRow[]
) {
  let cumulative =
    0;


  let peak =
    0;


  let maximumDrawdown =
    0;


  for (
    const trade of trades
  ) {
    cumulative +=
      toNumber(
        trade.net_profit
      );


    if (
      cumulative >
      peak
    ) {
      peak =
        cumulative;
    }


    const drawdown =
      peak -
      cumulative;


    if (
      drawdown >
      maximumDrawdown
    ) {
      maximumDrawdown =
        drawdown;
    }
  }


  return round(
    maximumDrawdown,
    8
  );
}


// ==========================================
// PERFORMANCE CURVE
// ==========================================

function calculatePerformanceCurve(
  trades: TradeRow[]
) {
  let cumulative =
    0;


  const points:
    PerformancePoint[] =
      [];


  trades.forEach(
    (
      trade,
      index
    ) => {

      const pnl =
        toNumber(
          trade.net_profit
        );


      cumulative +=
        pnl;


      points.push({
        trade:
          index + 1,

        time:
          trade.close_time,

        pnl:
          round(
            pnl,
            8
          ),

        cumulative:
          round(
            cumulative,
            8
          ),
      });
    }
  );


  /*
    The dashboard does not need
    10,000 SVG points.

    Metrics are calculated using
    ALL trades.

    Only the visual curve is
    downsampled.
  */

  const maxPoints =
    160;


  if (
    points.length <=
    maxPoints
  ) {
    return points;
  }


  const step =
    Math.ceil(
      points.length /
      maxPoints
    );


  const sampled:
    PerformancePoint[] =
      [];


  for (
    let index = 0;
    index <
    points.length;
    index += step
  ) {
    sampled.push(
      points[index]
    );
  }


  const lastPoint =
    points[
      points.length - 1
    ];


  const sampledLast =
    sampled[
      sampled.length - 1
    ];


  if (
    sampledLast.trade !==
    lastPoint.trade
  ) {
    sampled.push(
      lastPoint
    );
  }


  return sampled;
}


// ==========================================
// SYMBOL ANALYSIS
// ==========================================

function calculateBestSymbol(
  trades: TradeRow[]
): SymbolResult | null {

  const groups =
    new Map<
      string,
      number[]
    >();


  for (
    const trade of trades
  ) {
    const symbol =
      trade.symbol ||
      "Unknown";


    const pnl =
      toNumber(
        trade.net_profit
      );


    const existing =
      groups.get(
        symbol
      );


    if (existing) {
      existing.push(
        pnl
      );
    } else {
      groups.set(
        symbol,
        [pnl]
      );
    }
  }


  const results:
    SymbolResult[] =
      [];


  for (
    const [
      symbol,
      values,
    ] of groups
  ) {

    let wins =
      0;


    let grossProfit =
      0;


    let grossLoss =
      0;


    let netProfit =
      0;


    for (
      const pnl of values
    ) {
      netProfit +=
        pnl;


      if (pnl > 0) {
        wins++;

        grossProfit +=
          pnl;
      }

      else if (
        pnl < 0
      ) {
        grossLoss +=
          pnl;
      }
    }


    const profitFactor =
      grossLoss < 0
        ? grossProfit /
          Math.abs(
            grossLoss
          )
        : grossProfit > 0
          ? null
          : 0;


    results.push({
      symbol,

      trades:
        values.length,

      netProfit:
        round(
          netProfit,
          8
        ),

      winRate:
        values.length > 0
          ? round(
              (
                wins /
                values.length
              ) *
              100
            )
          : 0,

      profitFactor:
        profitFactor ===
        null
          ? null
          : round(
              profitFactor,
              8
            ),
    });
  }


  if (
    results.length ===
    0
  ) {
    return null;
  }


  /*
    Prefer markets with at least
    five completed trades.

    Otherwise one lucky trade could
    become "Best Market", which would
    be a remarkably human way to
    misuse statistics.
  */

  const qualified =
    results.filter(
      (result) =>
        result.trades >= 5
    );


  const candidates =
    qualified.length > 0
      ? qualified
      : results;


  candidates.sort(
    (a, b) =>
      b.netProfit -
      a.netProfit
  );


  return (
    candidates[0] ??
    null
  );
}


// ==========================================
// MAIN DASHBOARD METRICS
// ==========================================

export async function calculateAdvisorDashboardMetrics(
  connectionId: string,
  range: AdvisorDashboardRange
) {
  const trades =
    await loadTrades(
      connectionId,
      range
    );


  let wins =
    0;


  let losses =
    0;


  let breakeven =
    0;


  let grossProfit =
    0;


  let grossLoss =
    0;


  let netProfit =
    0;


  for (
    const trade of trades
  ) {
    const pnl =
      toNumber(
        trade.net_profit
      );


    netProfit +=
      pnl;


    if (pnl > 0) {
      wins++;

      grossProfit +=
        pnl;
    }

    else if (
      pnl < 0
    ) {
      losses++;

      grossLoss +=
        pnl;
    }

    else {
      breakeven++;
    }
  }


  const totalTrades =
    trades.length;


  const winRate =
    totalTrades > 0
      ? (
          wins /
          totalTrades
        ) *
        100
      : 0;


  const profitFactor =
    grossLoss < 0
      ? grossProfit /
        Math.abs(
          grossLoss
        )
      : grossProfit > 0
        ? null
        : 0;


  const expectancy =
    totalTrades > 0
      ? netProfit /
        totalTrades
      : 0;


  const maximumDrawdown =
    calculateMaxDrawdown(
      trades
    );


  const bestSymbol =
    calculateBestSymbol(
      trades
    );


  const performanceCurve =
    calculatePerformanceCurve(
      trades
    );


  return {
    range,

    totalTrades,

    winningTrades:
      wins,

    losingTrades:
      losses,

    breakevenTrades:
      breakeven,

    netProfit:
      round(
        netProfit,
        8
      ),

    grossProfit:
      round(
        grossProfit,
        8
      ),

    grossLoss:
      round(
        grossLoss,
        8
      ),

    winRate:
      round(
        winRate
      ),

    profitFactor:
      profitFactor ===
      null
        ? null
        : round(
            profitFactor,
            8
          ),

    expectancy:
      round(
        expectancy,
        8
      ),

    maxDrawdown:
      maximumDrawdown,

    bestSymbol,

    performanceCurve,
  };
}