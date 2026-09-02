import { supabaseAdmin } from "@/lib/supabaseAdmin";


type AdvisorTrade = {
  id: string;

  external_trade_id: string;

  symbol: string;

  direction:
    | "buy"
    | "sell";

  open_time: string;

  close_time: string;

  net_profit:
    | number
    | string
    | null;

  profit:
    | number
    | string;

  commission:
    | number
    | string;

  swap:
    | number
    | string;

  fee:
    | number
    | string;

  duration_seconds:
    | number
    | string
    | null;
};


type GroupMetrics = {
  trades: number;

  wins: number;

  losses: number;

  breakeven: number;

  winRate: number;

  netProfit: number;

  grossProfit: number;

  grossLoss: number;

  profitFactor: number | null;

  expectancy: number;

  averageWin: number;

  averageLoss: number;
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
// LOAD ALL NORMALIZED TRADES
// ==========================================

async function loadTrades(
  connectionId: string
) {
  const pageSize =
    1000;

  let offset =
    0;

  const trades:
    AdvisorTrade[] = [];


  while (true) {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "advisor_trades"
        )
        .select(`
          id,
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
          duration_seconds
        `)
        .eq(
          "connection_id",
          connectionId
        )
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
    (data ?? []) as unknown as AdvisorTrade[];

    trades.push(
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


  return trades;
}


// ==========================================
// CALCULATE GENERIC GROUP
// ==========================================

function calculateGroup(
  trades: AdvisorTrade[]
): GroupMetrics {

  let wins = 0;

  let losses = 0;

  let breakeven = 0;

  let grossProfit = 0;

  let grossLoss = 0;

  let netProfit = 0;


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

    else if (pnl < 0) {
      losses++;

      grossLoss +=
        pnl;
    }

    else {
      breakeven++;
    }
  }


  const total =
    trades.length;


  const winRate =
    total > 0
      ? (
          wins /
          total
        ) * 100
      : 0;


  const averageWin =
    wins > 0
      ? grossProfit /
        wins
      : 0;


  const averageLoss =
    losses > 0
      ? grossLoss /
        losses
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
    total > 0
      ? netProfit /
        total
      : 0;


  return {
    trades:
      total,

    wins,

    losses,

    breakeven,

    winRate:
      round(
        winRate
      ),

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

    profitFactor:
      profitFactor === null
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

    averageWin:
      round(
        averageWin,
        8
      ),

    averageLoss:
      round(
        averageLoss,
        8
      ),
  };
}


// ==========================================
// GROUP BY SYMBOL
// ==========================================

function calculateSymbols(
  trades: AdvisorTrade[]
) {
  const map =
    new Map<
      string,
      AdvisorTrade[]
    >();


  for (
    const trade of trades
  ) {
    const symbol =
      trade.symbol ||
      "Unknown";


    const current =
      map.get(
        symbol
      );


    if (current) {
      current.push(
        trade
      );
    } else {
      map.set(
        symbol,
        [trade]
      );
    }
  }


  return Array.from(
    map.entries()
  )
    .map(
      (
        [
          symbol,
          symbolTrades,
        ]
      ) => ({
        symbol,

        ...calculateGroup(
          symbolTrades
        ),
      })
    )
    .sort(
      (a, b) =>
        b.netProfit -
        a.netProfit
    );
}


// ==========================================
// GROUP BY DIRECTION
// ==========================================

function calculateDirections(
  trades: AdvisorTrade[]
) {
  const buys =
    trades.filter(
      (trade) =>
        trade.direction ===
        "buy"
    );


  const sells =
    trades.filter(
      (trade) =>
        trade.direction ===
        "sell"
    );


  return {
    buy:
      calculateGroup(
        buys
      ),

    sell:
      calculateGroup(
        sells
      ),
  };
}


// ==========================================
// WEEKDAY
// ==========================================

function calculateWeekdays(
  trades: AdvisorTrade[]
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
      AdvisorTrade[]
    >();


  for (
    let day = 0;
    day <= 6;
    day++
  ) {
    groups.set(
      day,
      []
    );
  }


  for (
    const trade of trades
  ) {
    /*
      We currently use the stored UTC
      timestamp.

      Later we can add selectable
      timezone/session analysis.
    */

    const day =
      new Date(
        trade.open_time
      ).getUTCDay();


    groups
      .get(day)!
      .push(
        trade
      );
  }


  return names.map(
    (name, day) => ({
      day,

      name,

      ...calculateGroup(
        groups.get(day) ??
        []
      ),
    })
  );
}


// ==========================================
// HOUR
// ==========================================

function calculateHours(
  trades: AdvisorTrade[]
) {
  const groups =
    new Map<
      number,
      AdvisorTrade[]
    >();


  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {
    groups.set(
      hour,
      []
    );
  }


  for (
    const trade of trades
  ) {
    const hour =
      new Date(
        trade.open_time
      ).getUTCHours();


    groups
      .get(hour)!
      .push(
        trade
      );
  }


  return Array.from(
    {
      length: 24,
    },
    (
      _,
      hour
    ) => ({
      hour,

      label:
        `${String(hour).padStart(
          2,
          "0"
        )}:00`,

      ...calculateGroup(
        groups.get(hour) ??
        []
      ),
    })
  );
}


// ==========================================
// EQUITY CURVE
// ==========================================

function calculateEquityCurve(
  trades: AdvisorTrade[]
) {
  let cumulative =
    0;


  return trades.map(
    (
      trade,
      index
    ) => {

      cumulative +=
        toNumber(
          trade.net_profit
        );


      return {
        index:
          index + 1,

        tradeId:
          trade.external_trade_id,

        time:
          trade.close_time,

        pnl:
          round(
            toNumber(
              trade.net_profit
            ),
            8
          ),

        cumulative:
          round(
            cumulative,
            8
          ),
      };
    }
  );
}


// ==========================================
// MAX CLOSED-TRADE DRAWDOWN
// ==========================================

function calculateMaxDrawdown(
  trades: AdvisorTrade[]
) {
  let cumulative =
    0;

  let peak =
    0;

  let maxDrawdown =
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
      maxDrawdown
    ) {
      maxDrawdown =
        drawdown;
    }
  }


  return round(
    maxDrawdown,
    8
  );
}


// ==========================================
// STREAKS
// ==========================================

function calculateStreaks(
  trades: AdvisorTrade[]
) {
  let currentWins =
    0;

  let currentLosses =
    0;

  let longestWins =
    0;

  let longestLosses =
    0;


  for (
    const trade of trades
  ) {
    const pnl =
      toNumber(
        trade.net_profit
      );


    if (pnl > 0) {
      currentWins++;

      currentLosses =
        0;


      longestWins =
        Math.max(
          longestWins,
          currentWins
        );
    }

    else if (pnl < 0) {
      currentLosses++;

      currentWins =
        0;


      longestLosses =
        Math.max(
          longestLosses,
          currentLosses
        );
    }

    else {
      currentWins =
        0;

      currentLosses =
        0;
    }
  }


  return {
    longestWinStreak:
      longestWins,

    longestLossStreak:
      longestLosses,
  };
}


// ==========================================
// MAIN METRICS ENGINE
// ==========================================

export async function calculateAdvisorMetrics(
  connectionId: string,
  userId: string
) {
  const trades =
    await loadTrades(
      connectionId
    );


  const overall =
    calculateGroup(
      trades
    );


  const {
    longestWinStreak,
    longestLossStreak,
  } =
    calculateStreaks(
      trades
    );


  const positiveTrades =
    trades.filter(
      (trade) =>
        toNumber(
          trade.net_profit
        ) > 0
    );


  const negativeTrades =
    trades.filter(
      (trade) =>
        toNumber(
          trade.net_profit
        ) < 0
    );


  const largestWin =
    positiveTrades.length >
    0
      ? Math.max(
          ...positiveTrades.map(
            (trade) =>
              toNumber(
                trade.net_profit
              )
          )
        )
      : 0;


  const largestLoss =
    negativeTrades.length >
    0
      ? Math.min(
          ...negativeTrades.map(
            (trade) =>
              toNumber(
                trade.net_profit
              )
          )
        )
      : 0;


  const durations =
    trades
      .map(
        (trade) =>
          toNumber(
            trade.duration_seconds
          )
      )
      .filter(
        (duration) =>
          duration >= 0
      );


  const averageDuration =
    durations.length > 0
      ? Math.round(
          durations.reduce(
            (
              total,
              duration
            ) =>
              total +
              duration,
            0
          ) /
          durations.length
        )
      : 0;


  const totalCommission =
    trades.reduce(
      (total, trade) =>
        total +
        toNumber(
          trade.commission
        ),
      0
    );


  const totalSwap =
    trades.reduce(
      (total, trade) =>
        total +
        toNumber(
          trade.swap
        ),
      0
    );


  const totalFees =
    trades.reduce(
      (total, trade) =>
        total +
        toNumber(
          trade.fee
        ),
      0
    );


  const payoffRatio =
    overall.averageLoss < 0
      ? overall.averageWin /
        Math.abs(
          overall.averageLoss
        )
      : null;


  const lossRate =
    overall.trades > 0
      ? (
          overall.losses /
          overall.trades
        ) * 100
      : 0;


  const directionMetrics =
    calculateDirections(
      trades
    );


  const symbolMetrics =
    calculateSymbols(
      trades
    );


  const weekdayMetrics =
    calculateWeekdays(
      trades
    );


  const hourMetrics =
    calculateHours(
      trades
    );


  const equityCurve =
    calculateEquityCurve(
      trades
    );


  const maxDrawdown =
    calculateMaxDrawdown(
      trades
    );


  const now =
    new Date()
      .toISOString();


  const metricsRow = {
    connection_id:
      connectionId,

    user_id:
      userId,

    metrics_version:
      1,

    total_trades:
      overall.trades,

    winning_trades:
      overall.wins,

    losing_trades:
      overall.losses,

    breakeven_trades:
      overall.breakeven,

    net_profit:
      overall.netProfit,

    gross_profit:
      overall.grossProfit,

    gross_loss:
      overall.grossLoss,

    win_rate:
      overall.winRate,

    loss_rate:
      round(
        lossRate
      ),

    profit_factor:
      overall.profitFactor,

    expectancy:
      overall.expectancy,

    average_win:
      overall.averageWin,

    average_loss:
      overall.averageLoss,

    payoff_ratio:
      payoffRatio === null
        ? null
        : round(
            payoffRatio,
            8
          ),

    largest_win:
      round(
        largestWin,
        8
      ),

    largest_loss:
      round(
        largestLoss,
        8
      ),

    max_drawdown_amount:
      maxDrawdown,

    longest_win_streak:
      longestWinStreak,

    longest_loss_streak:
      longestLossStreak,

    average_duration_seconds:
      averageDuration,

    total_commission:
      round(
        totalCommission,
        8
      ),

    total_swap:
      round(
        totalSwap,
        8
      ),

    total_fees:
      round(
        totalFees,
        8
      ),

    direction_metrics:
      directionMetrics,

    symbol_metrics:
      symbolMetrics,

    weekday_metrics:
      weekdayMetrics,

    hour_metrics:
      hourMetrics,

    equity_curve:
      equityCurve,

    calculated_at:
      now,

    updated_at:
      now,
  };


  // ========================================
  // UPSERT METRICS
  // ========================================

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "advisor_metrics"
      )
      .upsert(
        metricsRow,
        {
          onConflict:
            "connection_id",
        }
      )
      .select("*")
      .single();


  if (error) {
    throw new Error(
      `Could not save Advisor metrics: ${error.message}`
    );
  }


  return data;
}