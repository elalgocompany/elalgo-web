"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Gauge,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  supabase,
} from "@/lib/supabase";

import AuthModal from "@/app/auth/AuthModal";

// ==========================================
// TYPES
// ==========================================

type RangeValue =
  | "1d"
  | "1w"
  | "1m"
  | "3m"
  | "6m"
  | "1y"
  | "all";


type MetricGroup = {
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


type DirectionResult =
  MetricGroup & {
    direction:
      | "buy"
      | "sell";
  };


type SymbolResult =
  MetricGroup & {
    symbol: string;
  };


type WeekdayResult =
  MetricGroup & {
    weekday: string;

    weekdayNumber: number;
  };


type HourResult =
  MetricGroup & {
    hour: number;
  };


type DurationResult =
  MetricGroup & {
    id: string;

    label: string;
  };


type AdvisorInsight = {
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


type FullAnalysis = {
  range: RangeValue;

  overview:
    MetricGroup & {
      largestWin: number;

      largestLoss: number;

      maxDrawdown: number;

      longestWinStreak: number;

      longestLossStreak: number;

      averageDurationSeconds: number;

      partialCloseTrades: number;

      totalCommission: number;

      totalSwap: number;

      totalFees: number;
    };

  direction:
    DirectionResult[];

  symbols:
    SymbolResult[];

  timing: {
    weekdays:
      WeekdayResult[];

    hours:
      HourResult[];
  };

  durations:
    DurationResult[];

  consistency: {
    tradingDays: number;

    profitableDays: number;

    losingDays: number;

    breakevenDays: number;

    profitableDayRate: number;

    averageDailyPnL: number;

    bestDay:
      | {
          date: string;

          pnl: number;
        }
      | null;

    worstDay:
      | {
          date: string;

          pnl: number;
        }
      | null;
  };

  profitConcentration: {
    bestTrade: number;

    netWithoutBestTrade: number;

    bestTradeShareOfGrossProfit: number;

    topFiveShareOfGrossProfit: number;

    topTenPercentShareOfGrossProfit: number;
  };

  insights:
    AdvisorInsight[];
};


type FullAnalysisResponse = {
  success: boolean;

  connected?: boolean;

  error?: string;

  connection?:
    | {
        id: string;

        label:
          | string
          | null;

        accountNumber:
          | string
          | null;

        currency: string;

        broker:
          | string
          | null;

        server:
          | string
          | null;

        platform:
          | string
          | null;

        balance:
          | number
          | string
          | null;

        equity:
          | number
          | string
          | null;

        lastSyncAt:
          | string
          | null;

        lastConnectedAt:
          | string
          | null;
      }
    | null;

  analysis?:
    | FullAnalysis
    | null;
};


// ==========================================
// RANGE OPTIONS
// ==========================================

const ranges: {
  value: RangeValue;

  label: string;
}[] = [
  {
    value: "1d",
    label: "Day",
  },

  {
    value: "1w",
    label: "Week",
  },

  {
    value: "1m",
    label: "Month",
  },

  {
    value: "3m",
    label: "3 Months",
  },

  {
    value: "6m",
    label: "6 Months",
  },

  {
    value: "1y",
    label: "1 Year",
  },

  {
    value: "all",
    label: "All Time",
  },
];


// ==========================================
// FORMAT HELPERS
// ==========================================

function formatMoney(
  value: number,
  currency: string
) {
  try {

    return new Intl.NumberFormat(
      "en-US",
      {
        style:
          "currency",

        currency,

        maximumFractionDigits:
          2,
      }
    ).format(
      value
    );

  } catch {

    return `$${value.toFixed(
      2
    )}`;
  }
}


function formatProfitFactor(
  value:
    | number
    | null
) {

  if (
    value === null
  ) {
    return "∞";
  }


  return value.toFixed(
    2
  );
}


function formatDuration(
  seconds: number
) {

  if (
    seconds <
    60
  ) {
    return `${Math.round(
      seconds
    )} sec`;
  }


  if (
    seconds <
    3600
  ) {
    return `${Math.round(
      seconds /
      60
    )} min`;
  }


  if (
    seconds <
    86400
  ) {
    return `${(
      seconds /
      3600
    ).toFixed(
      1
    )} hr`;
  }


  return `${(
    seconds /
    86400
  ).toFixed(
    1
  )} days`;
}


function formatHour(
  hour: number
) {

  return `${String(
    hour
  ).padStart(
    2,
    "0"
  )}:00 UTC`;
}


// ==========================================
// MAIN PAGE
// ==========================================

export default function AdvisorFullAnalysisPage() {


    const [
        authOpen,
        setAuthOpen,
    ] =
  useState(false);
  const [
    range,
    setRange,
  ] =
    useState<RangeValue>(
      "1m"
    );


  const [
    data,
    setData,
  ] =
    useState<
      FullAnalysisResponse |
      null
    >(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(
      null
    );


  // ========================================
  // LOAD ANALYSIS
  // ========================================

  const loadAnalysis =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );


          setError(
            null
          );


          const {
            data:
              sessionData,
          } =
            await supabase
              .auth
              .getSession();


          const session =
            sessionData.session;


          if (!session) {

            setAuthOpen(
                true
            );

            setData(
                null
            );

            return;
            }


          const response =
            await fetch(
              `/api/advisor/full-analysis?range=${range}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${session.access_token}`,
                },
              }
            );


          const raw =
            await response.text();


          if (!raw) {

            throw new Error(
              `Advisor analysis returned an empty response. HTTP ${response.status}.`
            );
          }


          let json:
            FullAnalysisResponse;


          try {

  json =
    JSON.parse(
      raw
    );

} catch {

  console.error(
    "FULL ANALYSIS HTTP STATUS:",
    response.status
  );

  console.error(
    "FULL ANALYSIS CONTENT TYPE:",
    response.headers.get(
      "content-type"
    )
  );

  console.error(
    "FULL ANALYSIS RAW RESPONSE:",
    raw
  );


  throw new Error(
    `Advisor API returned non-JSON data. HTTP ${response.status}. Check browser console.`
  );
}


          if (
            !response.ok ||
            !json.success
          ) {

            throw new Error(
              json.error ??
              "Could not load Advisor analysis."
            );
          }


          setData(
            json
          );

        } catch (
          loadError
        ) {

          setError(
            loadError
              instanceof Error
              ? loadError.message
              : "Could not load Advisor analysis."
          );

        } finally {

          setLoading(
            false
          );
        }
      },
      [
        range,
      ]
    );


  useEffect(
    () => {

      loadAnalysis();

    },
    [
      loadAnalysis,
    ]
  );


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (
      <main className="
        min-h-screen
        bg-[#030712]
        px-6
        py-10
        text-white
      ">

        <div className="
          mx-auto
          max-w-7xl
        ">

          <div className="
            h-[650px]
            animate-pulse
            rounded-[32px]
            border
            border-white/[0.05]
            bg-white/[0.025]
          " />

        </div>

      </main>
    );
  }

if (
  authOpen
) {
  return (
    <main className="
      min-h-screen
      bg-[#030712]
      px-4
      py-8
      text-white
      sm:px-6
    ">

      <div className="
        mx-auto
        flex
        min-h-[70vh]
        max-w-7xl
        items-center
        justify-center
      ">

        <div className="
          max-w-xl
          text-center
        ">

          <p className="
            text-xs
            font-bold
            uppercase
            tracking-[0.3em]
            text-cyan-300
          ">
            ElAlgo Advisor
          </p>


          <h1 className="
            mt-4
            text-3xl
            font-semibold
            text-white
            sm:text-4xl
          ">
            Sign in to view your trading analysis
          </h1>


          <p className="
            mt-4
            leading-7
            text-slate-400
          ">
            Your Advisor Agent has synchronized
            your MetaTrader data. Sign in to
            access your full statistics and
            performance analysis.
          </p>

        </div>

      </div>


      <AuthModal
        open={
          authOpen
        }
        onClose={() =>
          setAuthOpen(
            false
          )
        }
        redirectTo="/dashboard/advisor"
      />

    </main>
  );
}
  // ========================================
  // ERROR
  // ========================================

  if (error) {

    return (
      <main className="
        min-h-screen
        bg-[#030712]
        px-6
        py-10
        text-white
      ">

        <div className="
          mx-auto
          max-w-7xl
        ">

          <Link
            href="/dashboard"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-slate-400
              transition
              hover:text-white
            "
          >
            <ArrowLeft
              size={16}
            />

            Dashboard
          </Link>


          <div className="
            mt-8
            rounded-3xl
            border
            border-red-400/15
            bg-red-400/[0.04]
            p-8
          ">

            <p className="
              text-sm
              text-red-300
            ">
              {error}
            </p>

          </div>

        </div>

      </main>
    );
  }


  // ========================================
  // NOT CONNECTED
  // ========================================

  if (
    !data?.connected ||
    !data.connection
  ) {

    return (
      <main className="
        min-h-screen
        bg-[#030712]
        px-6
        py-10
        text-white
      ">

        <div className="
          mx-auto
          max-w-7xl
        ">

          <Link
            href="/dashboard"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-slate-400
              transition
              hover:text-white
            "
          >
            <ArrowLeft
              size={16}
            />

            Dashboard
          </Link>


          <div className="
            mt-8
            rounded-[32px]
            border
            border-cyan-400/10
            bg-[#07101d]
            p-10
          ">

            <p className="
              text-xs
              font-bold
              uppercase
              tracking-[0.28em]
              text-cyan-300
            ">
              ElAlgo Advisor
            </p>


            <h1 className="
              mt-4
              text-3xl
              font-semibold
              text-white
            ">
              Connect MetaTrader first
            </h1>


            <p className="
              mt-4
              max-w-xl
              leading-7
              text-slate-400
            ">
              Advisor needs a connected
              MetaTrader account before it
              can analyze your trading
              history.
            </p>


            <Link
              href="/dashboard"
              className="
                mt-7
                inline-flex
                rounded-xl
                bg-cyan-400
                px-5
                py-3
                text-sm
                font-bold
                text-[#020611]
                transition
                hover:bg-cyan-300
              "
            >
              Return to Dashboard
            </Link>

          </div>

        </div>

      </main>
    );
  }


  const analysis =
    data.analysis;


  if (!analysis) {

    return null;
  }


  const currency =
    data.connection
      .currency ??
    "USD";


  const overview =
    analysis.overview;


  return (
    <main className="
      min-h-screen
      bg-[#030712]
      px-4
      py-8
      text-white
      sm:px-6
      lg:px-8
    ">

      <div className="
        mx-auto
        max-w-7xl
      ">

        {/* ==================================
            BACK
        ================================== */}

        <Link
          href="/dashboard"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-slate-500
            transition
            hover:text-white
          "
        >
          <ArrowLeft
            size={16}
          />

          Back to Dashboard
        </Link>


        {/* ==================================
            HERO
        ================================== */}

        <section className="
          relative
          mt-6
          overflow-hidden
          rounded-[32px]
          border
          border-cyan-400/15
          bg-[#07101d]
          p-6
          shadow-2xl
          shadow-cyan-950/20
          sm:p-8
        ">

          <div className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-96
            w-96
            rounded-full
            bg-cyan-400/10
            blur-[120px]
          " />


          <div className="
            relative
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-start
            lg:justify-between
          ">

            <div>

              <div className="
                flex
                flex-wrap
                items-center
                gap-3
              ">

                <p className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.3em]
                  text-cyan-300
                ">
                  ElAlgo Advisor
                </p>


                <span className="
                  rounded-full
                  border
                  border-emerald-400/20
                  bg-emerald-400/10
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-emerald-300
                ">
                  Connected
                </span>

              </div>


              <h1 className="
                mt-4
                text-3xl
                font-semibold
                tracking-tight
                text-white
                sm:text-4xl
                lg:text-5xl
              ">
                Your Trading Analysis
              </h1>


              <p className="
                mt-4
                max-w-2xl
                leading-7
                text-slate-400
              ">
                Advisor breaks down your
                completed trading history to
                expose strengths, weaknesses,
                risk patterns and performance
                concentration.
              </p>


              <div className="
                mt-6
                flex
                flex-wrap
                gap-x-5
                gap-y-2
                text-xs
                text-slate-500
              ">

                <span>
                  Account{" "}
                  <strong className="
                    font-medium
                    text-slate-300
                  ">
                    {
                      data.connection
                        .accountNumber
                    }
                  </strong>
                </span>


                {data.connection.platform && (

                  <span>
                    {
                      data.connection
                        .platform
                        .toUpperCase()
                    }
                  </span>

                )}


                {data.connection.broker && (

                  <span>
                    {
                      data.connection
                        .broker
                    }
                  </span>

                )}

              </div>

            </div>


            <select
              value={
                range
              }
              onChange={(
                event
              ) =>
                setRange(
                  event.target
                    .value as RangeValue
                )
              }
              className="
                rounded-xl
                border
                border-white/10
                bg-white/[0.04]
                px-4
                py-2.5
                text-sm
                text-slate-200
                outline-none
                transition
                hover:border-cyan-400/30
                focus:border-cyan-400/50
              "
            >

              {
                ranges.map(
                  (
                    item
                  ) => (

                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                      className="
                        bg-slate-950
                      "
                    >
                      {
                        item.label
                      }
                    </option>

                  )
                )
              }

            </select>

          </div>


          {/* MAIN PERFORMANCE */}

          <div className="
            relative
            mt-10
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-4
          ">

            <HeroMetric
              label="Net Performance"
              value={
                formatMoney(
                  overview.netProfit,
                  currency
                )
              }
              positive={
                overview.netProfit >=
                0
              }
            />


            <HeroMetric
              label="Profit Factor"
              value={
                formatProfitFactor(
                  overview.profitFactor
                )
              }
            />


            <HeroMetric
              label="Expectancy"
              value={
                formatMoney(
                  overview.expectancy,
                  currency
                )
              }
              positive={
                overview.expectancy >=
                0
              }
            />


            <HeroMetric
              label="Completed Trades"
              value={
                overview.trades
                  .toLocaleString()
              }
            />

          </div>

        </section>


        {/* ==================================
            ADVISOR FINDINGS
        ================================== */}

        <SectionHeader
          eyebrow="Advisor Findings"
          title="What your trading data is telling you"
          description="These findings are generated from deterministic performance rules, not AI guesswork."
        />


        <section className="
          grid
          gap-4
          lg:grid-cols-2
        ">

          {analysis.insights.length > 0 ? (

            analysis.insights.map(
              (
                insight
              ) => (

                <InsightCard
                  key={
                    insight.id
                  }
                  insight={
                    insight
                  }
                />

              )
            )

          ) : (

            <EmptyPanel
              text="Not enough trading data is available to produce meaningful findings for this period."
            />

          )}

        </section>


        {/* ==================================
            PERFORMANCE
        ================================== */}

        <SectionHeader
          eyebrow="Performance"
          title="Core trading statistics"
          description="The numbers behind the overall result."
        />


        <section className="
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-4
        ">

          <MetricCard
            label="Win Rate"
            value={`${overview.winRate.toFixed(
              1
            )}%`}
          />


          <MetricCard
            label="Average Win"
            value={
              formatMoney(
                overview.avgWin,
                currency
              )
            }
          />


          <MetricCard
            label="Average Loss"
            value={
              formatMoney(
                overview.avgLoss,
                currency
              )
            }
          />


          <MetricCard
            label="Payoff Ratio"
            value={
              formatProfitFactor(
                overview.payoffRatio
              )
            }
          />


          <MetricCard
            label="Gross Profit"
            value={
              formatMoney(
                overview.grossProfit,
                currency
              )
            }
          />


          <MetricCard
            label="Gross Loss"
            value={
              formatMoney(
                overview.grossLoss,
                currency
              )
            }
          />


          <MetricCard
            label="Largest Win"
            value={
              formatMoney(
                overview.largestWin,
                currency
              )
            }
          />


          <MetricCard
            label="Largest Loss"
            value={
              formatMoney(
                overview.largestLoss,
                currency
              )
            }
          />

        </section>


        {/* ==================================
            DIRECTION
        ================================== */}

        <SectionHeader
          eyebrow="Direction"
          title="Buy vs Sell performance"
          description="See whether one side of the market is carrying or damaging your results."
        />


        <section className="
          grid
          gap-4
          md:grid-cols-2
        ">

          {
            analysis.direction.map(
              (
                item
              ) => (

                <DirectionCard
                  key={
                    item.direction
                  }
                  item={
                    item
                  }
                  currency={
                    currency
                  }
                />

              )
            )
          }

        </section>


        {/* ==================================
            MARKETS
        ================================== */}

        <SectionHeader
          eyebrow="Markets"
          title="Where you perform best and worst"
          description="Markets are ranked by net closed-trade performance for the selected period."
        />


        <section className="
          overflow-hidden
          rounded-[28px]
          border
          border-white/[0.06]
          bg-[#07101d]
        ">

          <div className="
            overflow-x-auto
          ">

            <table className="
              min-w-full
              text-left
            ">

              <thead className="
                border-b
                border-white/[0.06]
                text-xs
                uppercase
                tracking-wider
                text-slate-500
              ">

                <tr>

                  <th className="
                    px-5
                    py-4
                    font-medium
                  ">
                    Market
                  </th>

                  <th className="
                    px-5
                    py-4
                    font-medium
                  ">
                    Trades
                  </th>

                  <th className="
                    px-5
                    py-4
                    font-medium
                  ">
                    Win Rate
                  </th>

                  <th className="
                    px-5
                    py-4
                    font-medium
                  ">
                    Profit Factor
                  </th>

                  <th className="
                    px-5
                    py-4
                    text-right
                    font-medium
                  ">
                    Net P/L
                  </th>

                </tr>

              </thead>


              <tbody>

                {
                  analysis.symbols
                    .slice(
                      0,
                      12
                    )
                    .map(
                      (
                        symbol
                      ) => (

                        <tr
                          key={
                            symbol.symbol
                          }
                          className="
                            border-b
                            border-white/[0.04]
                            last:border-b-0
                          "
                        >

                          <td className="
                            px-5
                            py-4
                            font-semibold
                            text-slate-200
                          ">
                            {
                              symbol.symbol
                            }
                          </td>


                          <td className="
                            px-5
                            py-4
                            text-sm
                            text-slate-400
                          ">
                            {
                              symbol.trades
                            }
                          </td>


                          <td className="
                            px-5
                            py-4
                            text-sm
                            text-slate-400
                          ">
                            {
                              symbol.winRate.toFixed(
                                1
                              )
                            }%
                          </td>


                          <td className="
                            px-5
                            py-4
                            text-sm
                            text-slate-400
                          ">
                            {
                              formatProfitFactor(
                                symbol.profitFactor
                              )
                            }
                          </td>


                          <td className={`
                            px-5
                            py-4
                            text-right
                            font-semibold

                            ${
                              symbol.netProfit >=
                              0
                                ? "text-emerald-300"
                                : "text-red-300"
                            }
                          `}>
                            {
                              formatMoney(
                                symbol.netProfit,
                                currency
                              )
                            }
                          </td>

                        </tr>

                      )
                    )
                }

              </tbody>

            </table>

          </div>

        </section>


        {/* ==================================
            TIMING
        ================================== */}

        <SectionHeader
          eyebrow="Timing"
          title="When your trades perform"
          description="Weekday and hour analysis is grouped by trade entry time."
        />


        <section className="
          grid
          gap-5
          xl:grid-cols-2
        ">

          <div className="
            rounded-[28px]
            border
            border-white/[0.06]
            bg-[#07101d]
            p-5
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <Clock3
                size={18}
                className="
                  text-cyan-300
                "
              />

              <h3 className="
                font-semibold
                text-white
              ">
                Weekday Performance
              </h3>

            </div>


            <div className="
              mt-5
              space-y-3
            ">

              {
                analysis.timing
                  .weekdays
                  .map(
                    (
                      day
                    ) => (

                      <PerformanceRow
                        key={
                          day.weekday
                        }
                        label={
                          day.weekday
                        }
                        detail={`${day.trades} trades`}
                        value={
                          formatMoney(
                            day.netProfit,
                            currency
                          )
                        }
                        positive={
                          day.netProfit >=
                          0
                        }
                      />

                    )
                  )
              }

            </div>

          </div>


          <TopHoursPanel
            hours={
              analysis.timing.hours
            }
            currency={
              currency
            }
          />

        </section>


        {/* ==================================
            RISK + CONSISTENCY
        ================================== */}

        <SectionHeader
          eyebrow="Risk & Consistency"
          title="How stable is the performance?"
          description="Profit alone is not enough. Advisor also looks at drawdown, streaks and concentration."
        />


        <section className="
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        ">

          <MetricCard
            label="Max Closed-Trade Drawdown"
            value={
              formatMoney(
                overview.maxDrawdown,
                currency
              )
            }
          />


          <MetricCard
            label="Longest Win Streak"
            value={`${overview.longestWinStreak} trades`}
          />


          <MetricCard
            label="Longest Loss Streak"
            value={`${overview.longestLossStreak} trades`}
          />


          <MetricCard
            label="Average Trade Duration"
            value={
              formatDuration(
                overview.averageDurationSeconds
              )
            }
          />


          <MetricCard
            label="Trading Days"
            value={
              analysis.consistency
                .tradingDays
                .toString()
            }
          />


          <MetricCard
            label="Profitable Days"
            value={`${analysis.consistency.profitableDayRate.toFixed(
              1
            )}%`}
          />


          <MetricCard
            label="Average Daily P/L"
            value={
              formatMoney(
                analysis.consistency
                  .averageDailyPnL,
                currency
              )
            }
          />


          <MetricCard
            label="Partial-Close Trades"
            value={
              overview
                .partialCloseTrades
                .toString()
            }
          />

        </section>


        {/* ==================================
            PROFIT CONCENTRATION
        ================================== */}

        <SectionHeader
          eyebrow="Profit Concentration"
          title="How dependent are you on your biggest winners?"
          description="A profitable strategy can still be fragile when most gains come from only a few trades."
        />


        <section className="
          grid
          gap-4
          lg:grid-cols-2
        ">

          <div className="
            rounded-[28px]
            border
            border-white/[0.06]
            bg-[#07101d]
            p-6
          ">

            <p className="
              text-sm
              text-slate-500
            ">
              Performance without your best trade
            </p>


            <p className={`
              mt-3
              text-3xl
              font-semibold

              ${
                analysis
                  .profitConcentration
                  .netWithoutBestTrade >=
                0
                  ? "text-emerald-300"
                  : "text-red-300"
              }
            `}>
              {
                formatMoney(
                  analysis
                    .profitConcentration
                    .netWithoutBestTrade,
                  currency
                )
              }
            </p>


            <p className="
              mt-3
              text-sm
              leading-6
              text-slate-500
            ">
              Your largest winner was{" "}
              {
                formatMoney(
                  analysis
                    .profitConcentration
                    .bestTrade,
                  currency
                )
              }.
            </p>

          </div>


          <div className="
            rounded-[28px]
            border
            border-white/[0.06]
            bg-[#07101d]
            p-6
          ">

            <ConcentrationRow
              label="Best trade share"
              value={
                analysis
                  .profitConcentration
                  .bestTradeShareOfGrossProfit
              }
            />


            <ConcentrationRow
              label="Top 5 winners share"
              value={
                analysis
                  .profitConcentration
                  .topFiveShareOfGrossProfit
              }
            />


            <ConcentrationRow
              label="Top 10% winners share"
              value={
                analysis
                  .profitConcentration
                  .topTenPercentShareOfGrossProfit
              }
            />

          </div>

        </section>


        {/* ==================================
            DURATION
        ================================== */}

        <SectionHeader
          eyebrow="Holding Time"
          title="Performance by trade duration"
          description="See whether fast trades or longer holds produce better outcomes."
        />


        <section className="
          grid
          gap-3
          sm:grid-cols-2
          xl:grid-cols-5
        ">

          {
            analysis.durations.map(
              (
                duration
              ) => (

                <div
                  key={
                    duration.id
                  }
                  className="
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-[#07101d]
                    p-5
                  "
                >

                  <p className="
                    text-xs
                    text-slate-500
                  ">
                    {
                      duration.label
                    }
                  </p>


                  <p className={`
                    mt-3
                    text-xl
                    font-semibold

                    ${
                      duration.netProfit >=
                      0
                        ? "text-emerald-300"
                        : "text-red-300"
                    }
                  `}>
                    {
                      formatMoney(
                        duration.netProfit,
                        currency
                      )
                    }
                  </p>


                  <p className="
                    mt-2
                    text-xs
                    text-slate-500
                  ">
                    {
                      duration.trades
                    } trades •{" "}
                    {
                      duration.winRate.toFixed(
                        1
                      )
                    }% win
                  </p>

                </div>

              )
            )
          }

        </section>


        {/* ==================================
            ACCOUNT / SYNC FOOTER
        ================================== */}

        <section className="
          mt-12
          rounded-[28px]
          border
          border-white/[0.06]
          bg-white/[0.02]
          p-6
        ">

          <div className="
            flex
            flex-col
            gap-5
            md:flex-row
            md:items-center
            md:justify-between
          ">

            <div>

              <p className="
                text-xs
                uppercase
                tracking-[0.2em]
                text-slate-600
              ">
                Advisor Connection
              </p>


              <p className="
                mt-2
                text-sm
                text-slate-400
              ">
                {
                  data.connection
                    .accountNumber
                }

                {
                  data.connection
                    .server
                    ? ` • ${data.connection.server}`
                    : ""
                }
              </p>


              <p className="
                mt-1
                text-xs
                text-slate-600
              ">
                Last synchronized{" "}

                {
                  data.connection
                    .lastSyncAt
                    ? new Date(
                        data.connection
                          .lastSyncAt
                      ).toLocaleString()
                    : "—"
                }
              </p>

            </div>


            <Link
              href="/dashboard"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-cyan-300
                transition
                hover:text-cyan-200
              "
            >
              <ArrowLeft
                size={16}
              />

              Back to Dashboard
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}


// ==========================================
// HERO METRIC
// ==========================================

function HeroMetric({
  label,
  value,
  positive,
}: {
  label: string;

  value: string;

  positive?: boolean;
}) {

  return (
    <div className="
      rounded-2xl
      border
      border-white/[0.06]
      bg-black/20
      p-5
    ">

      <p className="
        text-xs
        text-slate-500
      ">
        {label}
      </p>


      <p className={`
        mt-2
        text-2xl
        font-semibold
        tracking-tight

        ${
          positive === true
            ? "text-emerald-300"
            : positive === false
              ? "text-red-300"
              : "text-white"
        }
      `}>
        {value}
      </p>

    </div>
  );
}


// ==========================================
// STANDARD METRIC
// ==========================================

function MetricCard({
  label,
  value,
}: {
  label: string;

  value: string;
}) {

  return (
    <div className="
      rounded-2xl
      border
      border-white/[0.06]
      bg-[#07101d]
      p-5
    ">

      <p className="
        text-xs
        text-slate-500
      ">
        {label}
      </p>


      <p className="
        mt-2
        text-xl
        font-semibold
        text-slate-100
      ">
        {value}
      </p>

    </div>
  );
}


// ==========================================
// SECTION HEADER
// ==========================================

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;

  title: string;

  description: string;
}) {

  return (
    <div className="
      mb-5
      mt-12
    ">

      <p className="
        text-xs
        font-bold
        uppercase
        tracking-[0.24em]
        text-cyan-300
      ">
        {eyebrow}
      </p>


      <h2 className="
        mt-2
        text-2xl
        font-semibold
        text-white
      ">
        {title}
      </h2>


      <p className="
        mt-2
        max-w-2xl
        text-sm
        leading-6
        text-slate-500
      ">
        {description}
      </p>

    </div>
  );
}


// ==========================================
// INSIGHT CARD
// ==========================================

function InsightCard({
  insight,
}: {
  insight:
    AdvisorInsight;
}) {

  const styling =
    insight.importance ===
    "positive"

      ? {
          border:
            "border-emerald-400/15",

          background:
            "bg-emerald-400/[0.04]",

          icon:
            "text-emerald-300",

          Icon:
            CheckCircle2,
        }

      : insight.importance ===
        "warning"

        ? {
            border:
              "border-amber-400/15",

            background:
              "bg-amber-400/[0.04]",

            icon:
              "text-amber-300",

            Icon:
              AlertTriangle,
          }

        : {
            border:
              "border-cyan-400/15",

            background:
              "bg-cyan-400/[0.04]",

            icon:
              "text-cyan-300",

            Icon:
              Gauge,
          };


  const Icon =
    styling.Icon;


  return (
    <div className={`
      rounded-[26px]
      border
      p-5

      ${styling.border}
      ${styling.background}
    `}>

      <div className="
        flex
        gap-4
      ">

        <div className={`
          mt-0.5
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-white/[0.04]

          ${styling.icon}
        `}>

          <Icon
            size={18}
          />

        </div>


        <div>

          <p className="
            font-semibold
            text-white
          ">
            {
              insight.title
            }
          </p>


          <p className="
            mt-2
            text-sm
            leading-6
            text-slate-400
          ">
            {
              insight.message
            }
          </p>

        </div>

      </div>

    </div>
  );
}


// ==========================================
// DIRECTION CARD
// ==========================================

function DirectionCard({
  item,
  currency,
}: {
  item:
    DirectionResult;

  currency: string;
}) {

  const positive =
    item.netProfit >=
    0;


  return (
    <div className="
      rounded-[28px]
      border
      border-white/[0.06]
      bg-[#07101d]
      p-6
    ">

      <div className="
        flex
        items-center
        justify-between
      ">

        <div className="
          flex
          items-center
          gap-3
        ">

          <div className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-white/[0.04]
            text-cyan-300
          ">

            {
              item.direction ===
              "buy"

                ? (
                  <TrendingUp
                    size={19}
                  />
                )

                : (
                  <TrendingDown
                    size={19}
                  />
                )
            }

          </div>


          <div>

            <p className="
              text-xs
              uppercase
              tracking-wider
              text-slate-500
            ">
              Direction
            </p>


            <p className="
              mt-1
              font-semibold
              uppercase
              text-white
            ">
              {
                item.direction
              }
            </p>

          </div>

        </div>


        <p className={`
          text-2xl
          font-semibold

          ${
            positive
              ? "text-emerald-300"
              : "text-red-300"
          }
        `}>
          {
            formatMoney(
              item.netProfit,
              currency
            )
          }
        </p>

      </div>


      <div className="
        mt-6
        grid
        grid-cols-3
        gap-3
      ">

        <MiniMetric
          label="Trades"
          value={
            item.trades
              .toString()
          }
        />


        <MiniMetric
          label="Win Rate"
          value={`${item.winRate.toFixed(
            1
          )}%`}
        />


        <MiniMetric
          label="PF"
          value={
            formatProfitFactor(
              item.profitFactor
            )
          }
        />

      </div>

    </div>
  );
}


// ==========================================
// MINI METRIC
// ==========================================

function MiniMetric({
  label,
  value,
}: {
  label: string;

  value: string;
}) {

  return (
    <div className="
      rounded-xl
      bg-white/[0.025]
      p-3
    ">

      <p className="
        text-[10px]
        uppercase
        tracking-wider
        text-slate-600
      ">
        {label}
      </p>


      <p className="
        mt-1
        text-sm
        font-semibold
        text-slate-200
      ">
        {value}
      </p>

    </div>
  );
}


// ==========================================
// PERFORMANCE ROW
// ==========================================

function PerformanceRow({
  label,
  detail,
  value,
  positive,
}: {
  label: string;

  detail?: string;

  value: string;

  positive: boolean;
}) {

  return (
    <div className="
      flex
      items-center
      justify-between
      gap-4
      rounded-xl
      border
      border-white/[0.04]
      bg-white/[0.02]
      px-4
      py-3
    ">

      <div>

        <p className="
          text-sm
          font-medium
          text-slate-300
        ">
          {label}
        </p>


        {detail && (

          <p className="
            mt-1
            text-xs
            text-slate-600
          ">
            {detail}
          </p>

        )}

      </div>


      <p className={`
        text-sm
        font-semibold

        ${
          positive
            ? "text-emerald-300"
            : "text-red-300"
        }
      `}>
        {value}
      </p>

    </div>
  );
}


// ==========================================
// TOP HOURS
// ==========================================

function TopHoursPanel({
  hours,
  currency,
}: {
  hours:
    HourResult[];

  currency:
    string;
}) {

  const strongest =
    useMemo(
      () =>
        [
          ...hours,
        ]
          .sort(
            (
              a,
              b
            ) =>
              b.netProfit -
              a.netProfit
          )
          .slice(
            0,
            5
          ),
      [
        hours,
      ]
    );


  return (
    <div className="
      rounded-[28px]
      border
      border-white/[0.06]
      bg-[#07101d]
      p-5
    ">

      <div className="
        flex
        items-center
        gap-3
      ">

        <Target
          size={18}
          className="
            text-cyan-300
          "
        />


        <h3 className="
          font-semibold
          text-white
        ">
          Strongest Entry Hours
        </h3>

      </div>


      <div className="
        mt-5
        space-y-3
      ">

        {
          strongest.length >
          0

            ? strongest.map(
                (
                  hour
                ) => (

                  <PerformanceRow
                    key={
                      hour.hour
                    }
                    label={
                      formatHour(
                        hour.hour
                      )
                    }
                    detail={`${hour.trades} trades`}
                    value={
                      formatMoney(
                        hour.netProfit,
                        currency
                      )
                    }
                    positive={
                      hour.netProfit >=
                      0
                    }
                  />

                )
              )

            : (
              <p className="
                text-sm
                text-slate-500
              ">
                No timing data available.
              </p>
            )
        }

      </div>

    </div>
  );
}


// ==========================================
// CONCENTRATION
// ==========================================

function ConcentrationRow({
  label,
  value,
}: {
  label: string;

  value: number;
}) {

  const normalized =
    Math.min(
      Math.max(
        value,
        0
      ),
      100
    );


  return (
    <div className="
      py-3
    ">

      <div className="
        flex
        items-center
        justify-between
        gap-4
      ">

        <p className="
          text-sm
          text-slate-400
        ">
          {label}
        </p>


        <p className="
          text-sm
          font-semibold
          text-white
        ">
          {
            value.toFixed(
              1
            )
          }%
        </p>

      </div>


      <div className="
        mt-2
        h-1.5
        overflow-hidden
        rounded-full
        bg-white/[0.05]
      ">

        <div
          className="
            h-full
            rounded-full
            bg-cyan-400
          "
          style={{
            width:
              `${normalized}%`,
          }}
        />

      </div>

    </div>
  );
}


// ==========================================
// EMPTY PANEL
// ==========================================

function EmptyPanel({
  text,
}: {
  text: string;
}) {

  return (
    <div className="
      rounded-[26px]
      border
      border-white/[0.06]
      bg-white/[0.02]
      p-6
      text-sm
      text-slate-500
      lg:col-span-2
    ">
      {text}
    </div>
  );
}