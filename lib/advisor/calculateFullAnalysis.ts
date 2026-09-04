import {
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

import type {
  AdvisorDashboardRange,
} from "@/lib/advisor/calculateDashboardMetrics";


// ==========================================
// TYPES
// ==========================================

type TradeRow = {
  external_trade_id: string;

  symbol: string;

  direction:
    | "buy"
    | "sell"
    | string;

  open_time:
    | string
    | null;

  close_time: string;

  net_profit:
    | number
    | string
    | null;

  profit:
    | number
    | string
    | null;

  commission:
    | number
    | string
    | null;

  swap:
    | number
    | string
    | null;

  fee:
    | number
    | string
    | null;

  duration_seconds:
    | number
    | string
    | null;

  partial_close:
    | boolean
    | null;

  close_reason:
    | string
    | null;
};


export type AnalysisMetricGroup = {
  trades: number;

  wins: number;

  losses: number;

  breakeven: number;

  netProfit: number;

  grossProfit: number;

  grossLoss: number;

  winRate: number;

  profitFactor:
    | number
    | null;

  expectancy: number;

  avgWin: number;

  avgLoss: number;

  payoffRatio:
    | number
    | null;
};


export type AdvisorInsight = {
  id: string;

  category:
    | "performance"
    | "direction"
    | "market"
    | "risk"
    | "timing"
    | "consistency";

  importance:
    | "positive"
    | "warning"
    | "neutral";

  title: string;

  message: string;
};


type SymbolAnalysis =
  AnalysisMetricGroup & {
    symbol: string;
  };


type DirectionAnalysis =
  AnalysisMetricGroup & {
    direction:
      | "buy"
      | "sell";
  };


type WeekdayAnalysis =
  AnalysisMetricGroup & {
    weekday: string;

    weekdayNumber: number;
  };


type HourAnalysis =
  AnalysisMetricGroup & {
    hour: number;
  };


type DurationAnalysis =
  AnalysisMetricGroup & {
    id: string;

    label: string;
  };


// ==========================================
// HELPERS
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
// RANGE
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
// LOAD TRADES
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
    TradeRow[] =
      [];


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
          direction,
          open_time,
          close_time,
          net_profit,
          profit,
          commission,
          swap,
          fee,
          duration_seconds,
          partial_close,
          close_reason
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
      const trade of page
    ) {

      trades.push(
        trade as TradeRow
      );
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
// GENERIC METRIC CALCULATOR
// ==========================================

function calculateGroupMetrics(
  trades: TradeRow[]
): AnalysisMetricGroup {

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

  let totalWinningProfit =
    0;

  let totalLosingProfit =
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


    if (
      pnl > 0
    ) {

      wins++;

      grossProfit +=
        pnl;

      totalWinningProfit +=
        pnl;

    } else if (
      pnl < 0
    ) {

      losses++;

      grossLoss +=
        pnl;

      totalLosingProfit +=
        pnl;

    } else {

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


  const avgWin =
    wins > 0

      ? totalWinningProfit /
        wins

      : 0;


  const avgLoss =
    losses > 0

      ? totalLosingProfit /
        losses

      : 0;


  const payoffRatio =
    avgLoss < 0

      ? avgWin /
        Math.abs(
          avgLoss
        )

      : avgWin > 0

        ? null

        : 0;


  return {
    trades:
      totalTrades,

    wins,

    losses,

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

    avgWin:
      round(
        avgWin,
        8
      ),

    avgLoss:
      round(
        avgLoss,
        8
      ),

    payoffRatio:
      payoffRatio ===
      null

        ? null

        : round(
            payoffRatio,
            8
          ),
  };
}


// ==========================================
// DRAWDOWN
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
// STREAKS
// ==========================================

function calculateStreaks(
  trades: TradeRow[]
) {

  let currentWin =
    0;

  let currentLoss =
    0;

  let longestWin =
    0;

  let longestLoss =
    0;


  for (
    const trade of trades
  ) {

    const pnl =
      toNumber(
        trade.net_profit
      );


    if (
      pnl > 0
    ) {

      currentWin++;

      currentLoss =
        0;


      longestWin =
        Math.max(
          longestWin,
          currentWin
        );

    } else if (
      pnl < 0
    ) {

      currentLoss++;

      currentWin =
        0;


      longestLoss =
        Math.max(
          longestLoss,
          currentLoss
        );

    } else {

      currentWin =
        0;

      currentLoss =
        0;
    }
  }


  return {
    longestWinStreak:
      longestWin,

    longestLossStreak:
      longestLoss,
  };
}


// ==========================================
// DIRECTION
// ==========================================

function calculateDirectionAnalysis(
  trades: TradeRow[]
) {

  const buy =
    trades.filter(
      (
        trade
      ) =>
        trade.direction ===
        "buy"
    );


  const sell =
    trades.filter(
      (
        trade
      ) =>
        trade.direction ===
        "sell"
    );


  const result:
    DirectionAnalysis[] =
      [];


  if (
    buy.length > 0
  ) {

    result.push({
      direction:
        "buy",

      ...calculateGroupMetrics(
        buy
      ),
    });
  }


  if (
    sell.length > 0
  ) {

    result.push({
      direction:
        "sell",

      ...calculateGroupMetrics(
        sell
      ),
    });
  }


  return result;
}


// ==========================================
// SYMBOLS
// ==========================================

function calculateSymbolAnalysis(
  trades: TradeRow[]
) {

  const groups =
    new Map<
      string,
      TradeRow[]
    >();


  for (
    const trade of trades
  ) {

    const symbol =
      trade.symbol ||
      "Unknown";


    const existing =
      groups.get(
        symbol
      );


    if (existing) {

      existing.push(
        trade
      );

    } else {

      groups.set(
        symbol,
        [
          trade,
        ]
      );
    }
  }


  const results:
    SymbolAnalysis[] =
      [];


  for (
    const [
      symbol,
      symbolTrades,
    ] of groups
  ) {

    results.push({
      symbol,

      ...calculateGroupMetrics(
        symbolTrades
      ),
    });
  }


  results.sort(
    (
      a,
      b
    ) =>
      b.netProfit -
      a.netProfit
  );


  return results;
}


// ==========================================
// WEEKDAY ANALYSIS
// ==========================================

function calculateWeekdayAnalysis(
  trades: TradeRow[]
) {

  const names = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];


  const groups =
    new Map<
      number,
      TradeRow[]
    >();


  for (
    const trade of trades
  ) {

    const date =
      new Date(
        trade.open_time ??
        trade.close_time
      );


    const weekday =
      date.getUTCDay();


    const existing =
      groups.get(
        weekday
      );


    if (existing) {

      existing.push(
        trade
      );

    } else {

      groups.set(
        weekday,
        [
          trade,
        ]
      );
    }
  }


  const results:
    WeekdayAnalysis[] =
      [];


  for (
    const [
      weekdayNumber,
      dayTrades,
    ] of groups
  ) {

    results.push({
      weekday:
        names[
          weekdayNumber
        ],

      weekdayNumber,

      ...calculateGroupMetrics(
        dayTrades
      ),
    });
  }


  results.sort(
    (
      a,
      b
    ) =>
      a.weekdayNumber -
      b.weekdayNumber
  );


  return results;
}


// ==========================================
// HOUR ANALYSIS
// ==========================================

function calculateHourAnalysis(
  trades: TradeRow[]
) {

  const groups =
    new Map<
      number,
      TradeRow[]
    >();


  for (
    const trade of trades
  ) {

    const date =
      new Date(
        trade.open_time ??
        trade.close_time
      );


    const hour =
      date.getUTCHours();


    const existing =
      groups.get(
        hour
      );


    if (existing) {

      existing.push(
        trade
      );

    } else {

      groups.set(
        hour,
        [
          trade,
        ]
      );
    }
  }


  const results:
    HourAnalysis[] =
      [];


  for (
    const [
      hour,
      hourTrades,
    ] of groups
  ) {

    results.push({
      hour,

      ...calculateGroupMetrics(
        hourTrades
      ),
    });
  }


  results.sort(
    (
      a,
      b
    ) =>
      a.hour -
      b.hour
  );


  return results;
}


// ==========================================
// DURATION ANALYSIS
// ==========================================

function calculateDurationAnalysis(
  trades: TradeRow[]
) {

  const buckets = [
    {
      id:
        "under_5m",

      label:
        "Under 5 min",

      minimum:
        0,

      maximum:
        5 *
        60,
    },

    {
      id:
        "5m_30m",

      label:
        "5 – 30 min",

      minimum:
        5 *
        60,

      maximum:
        30 *
        60,
    },

    {
      id:
        "30m_2h",

      label:
        "30 min – 2 hr",

      minimum:
        30 *
        60,

      maximum:
        2 *
        60 *
        60,
    },

    {
      id:
        "2h_8h",

      label:
        "2 – 8 hr",

      minimum:
        2 *
        60 *
        60,

      maximum:
        8 *
        60 *
        60,
    },

    {
      id:
        "over_8h",

      label:
        "Over 8 hr",

      minimum:
        8 *
        60 *
        60,

      maximum:
        Infinity,
    },
  ];


  const results:
    DurationAnalysis[] =
      [];


  for (
    const bucket of buckets
  ) {

    const bucketTrades =
      trades.filter(
        (
          trade
        ) => {

          const duration =
            toNumber(
              trade.duration_seconds
            );


          return (
            duration >=
              bucket.minimum &&
            duration <
              bucket.maximum
          );
        }
      );


    if (
      bucketTrades.length ===
      0
    ) {
      continue;
    }


    results.push({
      id:
        bucket.id,

      label:
        bucket.label,

      ...calculateGroupMetrics(
        bucketTrades
      ),
    });
  }


  return results;
}


// ==========================================
// PROFIT CONCENTRATION
// ==========================================

function calculateProfitConcentration(
  trades: TradeRow[]
) {

  const profits =
    trades
      .map(
        (
          trade
        ) =>
          toNumber(
            trade.net_profit
          )
      )
      .sort(
        (
          a,
          b
        ) =>
          b -
          a
      );


  const winningProfits =
    profits.filter(
      (
        pnl
      ) =>
        pnl > 0
    );


  const grossProfit =
    winningProfits.reduce(
      (
        sum,
        pnl
      ) =>
        sum +
        pnl,
      0
    );


  const netProfit =
    profits.reduce(
      (
        sum,
        pnl
      ) =>
        sum +
        pnl,
      0
    );


  const bestTrade =
    profits[0] ??
    0;


  const topFiveProfit =
    winningProfits
      .slice(
        0,
        5
      )
      .reduce(
        (
          sum,
          pnl
        ) =>
          sum +
          pnl,
        0
      );


  const topTenPercentCount =
    Math.max(
      1,
      Math.ceil(
        trades.length *
        0.1
      )
    );


  const topTenPercentProfit =
    winningProfits
      .slice(
        0,
        topTenPercentCount
      )
      .reduce(
        (
          sum,
          pnl
        ) =>
          sum +
          pnl,
        0
      );


  return {
    bestTrade:
      round(
        bestTrade,
        8
      ),

    netWithoutBestTrade:
      round(
        netProfit -
        bestTrade,
        8
      ),

    bestTradeShareOfGrossProfit:
      grossProfit > 0
        ? round(
            (
              bestTrade /
              grossProfit
            ) *
            100
          )
        : 0,

    topFiveShareOfGrossProfit:
      grossProfit > 0
        ? round(
            (
              topFiveProfit /
              grossProfit
            ) *
            100
          )
        : 0,

    topTenPercentShareOfGrossProfit:
      grossProfit > 0
        ? round(
            (
              topTenPercentProfit /
              grossProfit
            ) *
            100
          )
        : 0,
  };
}


// ==========================================
// DAILY CONSISTENCY
// ==========================================

function calculateDailyConsistency(
  trades: TradeRow[]
) {

  const days =
    new Map<
      string,
      number
    >();


  for (
    const trade of trades
  ) {

    const date =
      new Date(
        trade.close_time
      );


    const key =
      date
        .toISOString()
        .slice(
          0,
          10
        );


    days.set(
      key,
      (
        days.get(
          key
        ) ??
        0
      ) +
      toNumber(
        trade.net_profit
      )
    );
  }


  const values =
    Array.from(
      days.entries()
    );


  let profitableDays =
    0;

  let losingDays =
    0;

  let breakevenDays =
    0;


  for (
    const [
      ,
      pnl,
    ] of values
  ) {

    if (
      pnl > 0
    ) {

      profitableDays++;

    } else if (
      pnl < 0
    ) {

      losingDays++;

    } else {

      breakevenDays++;
    }
  }


  const sorted =
    [
      ...values,
    ].sort(
      (
        a,
        b
      ) =>
        b[1] -
        a[1]
    );


  const bestDay =
    sorted[0] ??
    null;


  const worstDay =
    sorted[
      sorted.length -
      1
    ] ??
    null;


  const total =
    values.reduce(
      (
        sum,
        [
          ,
          pnl,
        ]
      ) =>
        sum +
        pnl,
      0
    );


  return {
    tradingDays:
      values.length,

    profitableDays,

    losingDays,

    breakevenDays,

    profitableDayRate:
      values.length > 0
        ? round(
            (
              profitableDays /
              values.length
            ) *
            100
          )
        : 0,

    averageDailyPnL:
      values.length > 0
        ? round(
            total /
            values.length,
            8
          )
        : 0,

    bestDay:
      bestDay
        ? {
            date:
              bestDay[0],

            pnl:
              round(
                bestDay[1],
                8
              ),
          }
        : null,

    worstDay:
      worstDay
        ? {
            date:
              worstDay[0],

            pnl:
              round(
                worstDay[1],
                8
              ),
          }
        : null,
  };
}


// ==========================================
// INSIGHTS
// ==========================================

function generateInsights(
  overview: AnalysisMetricGroup,
  directions: DirectionAnalysis[],
  symbols: SymbolAnalysis[],
  maxDrawdown: number,
  streaks: {
    longestWinStreak: number;
    longestLossStreak: number;
  },
  concentration: {
    bestTrade: number;
    netWithoutBestTrade: number;
    bestTradeShareOfGrossProfit: number;
    topFiveShareOfGrossProfit: number;
    topTenPercentShareOfGrossProfit: number;
  }
): AdvisorInsight[] {

  const insights:
    AdvisorInsight[] =
      [];


  // ========================================
  // OVERALL PROFITABILITY
  // ========================================

  if (
    overview.trades >= 10
  ) {

    if (
      overview.profitFactor !==
        null &&
      overview.profitFactor >=
        1.2 &&
      overview.netProfit > 0
    ) {

      insights.push({
        id:
          "overall-positive",

        category:
          "performance",

        importance:
          "positive",

        title:
          "Positive overall expectancy",

        message:
          `Your ${overview.trades} completed trades produced ${round(
            overview.expectancy,
            2
          )} per trade on average with a profit factor of ${round(
            overview.profitFactor,
            2
          )}.`,
      });

    } else if (
      overview.profitFactor !==
        null &&
      overview.profitFactor <
        1
    ) {

      insights.push({
        id:
          "overall-negative",

        category:
          "performance",

        importance:
          "warning",

        title:
          "Losses currently outweigh profits",

        message:
          `Your profit factor is ${round(
            overview.profitFactor,
            2
          )}, meaning gross losses exceed gross profits in this period.`,
      });
    }
  }


  // ========================================
  // DIRECTION IMBALANCE
  // ========================================

  const buy =
    directions.find(
      (
        item
      ) =>
        item.direction ===
        "buy"
    );


  const sell =
    directions.find(
      (
        item
      ) =>
        item.direction ===
        "sell"
    );


  if (
    buy &&
    sell &&
    buy.trades >= 5 &&
    sell.trades >= 5
  ) {

    if (
      buy.netProfit > 0 &&
      sell.netProfit < 0
    ) {

      insights.push({
        id:
          "buy-outperforming",

        category:
          "direction",

        importance:
          "warning",

        title:
          "Buy trades are carrying performance",

        message:
          `Buy trades generated ${round(
            buy.netProfit,
            2
          )}, while sell trades generated ${round(
            sell.netProfit,
            2
          )}. Sell-side performance is reducing the overall result.`,
      });

    } else if (
      sell.netProfit > 0 &&
      buy.netProfit < 0
    ) {

      insights.push({
        id:
          "sell-outperforming",

        category:
          "direction",

        importance:
          "warning",

        title:
          "Sell trades are carrying performance",

        message:
          `Sell trades generated ${round(
            sell.netProfit,
            2
          )}, while buy trades generated ${round(
            buy.netProfit,
            2
          )}. Buy-side performance is reducing the overall result.`,
      });
    }
  }


  // ========================================
  // SYMBOL STRENGTH / WEAKNESS
  // ========================================

  const qualifiedSymbols =
    symbols.filter(
      (
        symbol
      ) =>
        symbol.trades >= 5
    );


  if (
    qualifiedSymbols.length > 0
  ) {

    const strongest =
      qualifiedSymbols[0];


    const weakest =
      [
        ...qualifiedSymbols,
      ].sort(
        (
          a,
          b
        ) =>
          a.netProfit -
          b.netProfit
      )[0];


    if (
      strongest &&
      strongest.netProfit > 0
    ) {

      insights.push({
        id:
          "strongest-market",

        category:
          "market",

        importance:
          "positive",

        title:
          `${strongest.symbol} is your strongest market`,

        message:
          `${strongest.symbol} produced ${round(
            strongest.netProfit,
            2
          )} across ${strongest.trades} completed trades.`,
      });
    }


    if (
      weakest &&
      weakest.netProfit < 0
    ) {

      insights.push({
        id:
          "weakest-market",

        category:
          "market",

        importance:
          "warning",

        title:
          `${weakest.symbol} is reducing performance`,

        message:
          `${weakest.symbol} produced ${round(
            weakest.netProfit,
            2
          )} across ${weakest.trades} completed trades.`,
      });
    }
  }


  // ========================================
  // PROFIT CONCENTRATION
  // ========================================

  if (
    overview.trades >= 20 &&
    concentration
      .bestTradeShareOfGrossProfit >=
      30
  ) {

    insights.push({
      id:
        "profit-concentration",

      category:
        "consistency",

      importance:
        "warning",

      title:
        "Performance depends heavily on one trade",

      message:
        `Your best trade represents ${round(
          concentration
            .bestTradeShareOfGrossProfit,
          1
        )}% of total gross profit. Without that trade, net performance would be ${round(
          concentration
            .netWithoutBestTrade,
          2
        )}.`,
    });
  }


  // ========================================
  // LOSS STREAK
  // ========================================

  if (
    streaks.longestLossStreak >=
    10
  ) {

    insights.push({
      id:
        "loss-streak",

      category:
        "risk",

      importance:
        "warning",

      title:
        "Long losing streak detected",

      message:
        `The longest losing sequence in this period was ${streaks.longestLossStreak} consecutive losing trades.`,
    });
  }


  // ========================================
  // DRAWDOWN
  // ========================================

  if (
    maxDrawdown > 0
  ) {

    insights.push({
      id:
        "drawdown",

      category:
        "risk",

      importance:
        "neutral",

      title:
        "Largest closed-trade drawdown",

      message:
        `The largest peak-to-trough decline in cumulative closed-trade P/L was ${round(
          maxDrawdown,
          2
        )}.`,
    });
  }


  return insights;
}


// ==========================================
// MAIN
// ==========================================

export async function calculateFullAdvisorAnalysis(
  connectionId: string,
  range: AdvisorDashboardRange
) {

  const trades =
    await loadTrades(
      connectionId,
      range
    );


  const overview =
    calculateGroupMetrics(
      trades
    );


  const maxDrawdown =
    calculateMaxDrawdown(
      trades
    );


  const streaks =
    calculateStreaks(
      trades
    );


  const direction =
    calculateDirectionAnalysis(
      trades
    );


  const symbols =
    calculateSymbolAnalysis(
      trades
    );


  const weekdays =
    calculateWeekdayAnalysis(
      trades
    );


  const hours =
    calculateHourAnalysis(
      trades
    );


  const durations =
    calculateDurationAnalysis(
      trades
    );


  const profitConcentration =
    calculateProfitConcentration(
      trades
    );


  const consistency =
    calculateDailyConsistency(
      trades
    );


  const insights =
    generateInsights(
      overview,
      direction,
      symbols,
      maxDrawdown,
      streaks,
      profitConcentration
    );


  const profits =
    trades.map(
      (
        trade
      ) =>
        toNumber(
          trade.net_profit
        )
    );


  const largestWin =
    profits.length > 0
      ? Math.max(
          ...profits,
          0
        )
      : 0;


  const largestLoss =
    profits.length > 0
      ? Math.min(
          ...profits,
          0
        )
      : 0;


  const totalDuration =
    trades.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        toNumber(
          trade.duration_seconds
        ),
      0
    );


  const averageDurationSeconds =
    trades.length > 0

      ? totalDuration /
        trades.length

      : 0;


  const partialCloseTrades =
    trades.filter(
      (
        trade
      ) =>
        trade.partial_close ===
        true
    ).length;


  const totalCommission =
    trades.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        toNumber(
          trade.commission
        ),
      0
    );


  const totalSwap =
    trades.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        toNumber(
          trade.swap
        ),
      0
    );


  const totalFees =
    trades.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        toNumber(
          trade.fee
        ),
      0
    );


  return {
    range,

    overview: {
      ...overview,

      largestWin:
        round(
          largestWin,
          8
        ),

      largestLoss:
        round(
          largestLoss,
          8
        ),

      maxDrawdown,

      longestWinStreak:
        streaks
          .longestWinStreak,

      longestLossStreak:
        streaks
          .longestLossStreak,

      averageDurationSeconds:
        round(
          averageDurationSeconds
        ),

      partialCloseTrades,

      totalCommission:
        round(
          totalCommission,
          8
        ),

      totalSwap:
        round(
          totalSwap,
          8
        ),

      totalFees:
        round(
          totalFees,
          8
        ),
    },

    direction,

    symbols,

    timing: {
      weekdays,

      hours,
    },

    durations,

    consistency,

    profitConcentration,

    insights,
  };
}