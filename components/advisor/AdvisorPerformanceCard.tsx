"use client";


import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


import Link from "next/link";


import {
  supabase,
} from "@/lib/supabase";


type RangeValue =
  | "1d"
  | "1w"
  | "1m"
  | "3m"
  | "6m"
  | "1y"
  | "all";


type CurvePoint = {
  trade: number;

  time: string;

  pnl: number;

  cumulative: number;
};


type BestSymbol = {
  symbol: string;

  trades: number;

  netProfit: number;

  winRate: number;

  profitFactor:
    | number
    | null;
};


type Metrics = {
  range: RangeValue;

  totalTrades: number;

  winningTrades: number;

  losingTrades: number;

  breakevenTrades: number;

  netProfit: number;

  grossProfit: number;

  grossLoss: number;

  winRate: number;

  profitFactor:
    | number
    | null;

  expectancy: number;

  maxDrawdown: number;

  bestSymbol:
    | BestSymbol
    | null;

  performanceCurve:
    CurvePoint[];
};


type AdvisorResponse = {
  success: boolean;

  connected?: boolean;

  error?: string;

  connection?: {
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

    lastSyncAt:
      | string
      | null;
  };

  metrics?: Metrics;
};


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
// FORMAT MONEY
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
  }

  catch {
    return `$${value.toFixed(
      2
    )}`;
  }
}


// ==========================================
// FORMAT PROFIT FACTOR
// ==========================================

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


// ==========================================
// PERFORMANCE CHART
// ==========================================

function PerformanceChart({
  points,
}: {
  points: CurvePoint[];
}) {

  const chart =
    useMemo(
      () => {

        if (
          points.length ===
          0
        ) {
          return null;
        }


        const width =
          1000;


        const height =
          260;


        const padding =
          10;


        const values =
          points.map(
            (
              point
            ) =>
              point.cumulative
          );


        let minimum =
          Math.min(
            ...values,
            0
          );


        let maximum =
          Math.max(
            ...values,
            0
          );


        if (
          minimum === maximum
        ) {
          minimum -=
            1;

          maximum +=
            1;
        }


        const range =
          maximum -
          minimum;


        const xFor =
          (
            index: number
          ) => {

            if (
              points.length ===
              1
            ) {
              return (
                width /
                2
              );
            }


            return (
              padding +
              (
                index /
                (
                  points.length -
                  1
                )
              ) *
              (
                width -
                padding *
                2
              )
            );
          };


        const yFor =
          (
            value: number
          ) => {

            return (
              height -
              padding -
              (
                (
                  value -
                  minimum
                ) /
                range
              ) *
              (
                height -
                padding *
                2
              )
            );
          };


        const path =
          points
            .map(
              (
                point,
                index
              ) => {

                const x =
                  xFor(
                    index
                  );


                const y =
                  yFor(
                    point.cumulative
                  );


                return (
                  index === 0
                    ? `M ${x} ${y}`
                    : `L ${x} ${y}`
                );
              }
            )
            .join(
              " "
            );


        const zeroY =
          yFor(
            0
          );


        return {
          width,

          height,

          path,

          zeroY,

          last:
            points[
              points.length -
              1
            ],
        };
      },
      [
        points,
      ]
    );


  if (!chart) {
    return (
      <div className="
        flex
        h-[260px]
        items-center
        justify-center
        text-sm
        text-slate-500
      ">
        No completed trades in this period.
      </div>
    );
  }


  return (
    <div className="
      relative
      h-[260px]
      w-full
      overflow-hidden
    ">
      <svg
        viewBox={`
          0
          0
          ${chart.width}
          ${chart.height}
        `}
        preserveAspectRatio="none"
        className="
          h-full
          w-full
        "
      >
        <defs>
          <linearGradient
            id="advisorCurveGlow"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#22d3ee"
              stopOpacity="0.35"
            />

            <stop
              offset="100%"
              stopColor="#22d3ee"
              stopOpacity="0"
            />
          </linearGradient>

          <filter
            id="advisorGlow"
          >
            <feGaussianBlur
              stdDeviation="4"
              result="blur"
            />

            <feMerge>
              <feMergeNode
                in="blur"
              />

              <feMergeNode
                in="SourceGraphic"
              />
            </feMerge>
          </filter>
        </defs>


        <line
          x1="0"
          x2={chart.width}
          y1={chart.zeroY}
          y2={chart.zeroY}
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray="8 8"
        />


        <path
          d={`
            ${chart.path}
            L ${chart.width} ${chart.height}
            L 0 ${chart.height}
            Z
          `}
          fill="url(#advisorCurveGlow)"
          opacity="0.45"
        />


        <path
          d={chart.path}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          filter="url(#advisorGlow)"
        />
      </svg>
    </div>
  );
}


// ==========================================
// MAIN CARD
// ==========================================

export default function AdvisorPerformanceCard() {

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
      AdvisorResponse |
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


  const loadMetrics =
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
            setError(
              "."
            );

            return;
          }


          const response =
            await fetch(
              `/api/advisor/dashboard-metrics?range=${range}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${session.access_token}`,
                },
              }
            );


          const json:
            AdvisorResponse =
              await response.json();


          if (
            !response.ok ||
            !json.success
          ) {
            throw new Error(
              json.error ??
              "Could not load Advisor metrics."
            );
          }


          setData(
            json
          );
        }

        catch (
          loadError
        ) {
          setError(
            loadError
              instanceof Error
              ? loadError.message
              : "Could not load Advisor metrics."
          );
        }

        finally {
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
      loadMetrics();
    },
    [
      loadMetrics,
    ]
  );


  if (loading) {
    return (
      <section className="
        rounded-[28px]
        border
        border-cyan-400/10
        bg-slate-950/70
        p-8
      ">
        <div className="
          h-[420px]
          animate-pulse
          rounded-3xl
          bg-white/[0.03]
        " />
      </section>
    );
  }


  if (error) {
    return (
      <section className="
        rounded-[28px]
        border
        border-red-400/10
        bg-slate-950/70
        p-8
      ">
        <p className="
          text-sm
          text-red-300
        ">
          {error}
        </p>
      </section>
    );
  }


  if (
    !data?.connected
  ) {
    return (
      <section className="
        rounded-[28px]
        border
        border-cyan-400/10
        bg-slate-950/70
        p-8
      ">
        <p className="
          text-xs
          font-semibold
          uppercase
          tracking-[0.28em]
          text-cyan-300
        ">
          ElAlgo Advisor
        </p>

        <h2 className="
          mt-3
          text-2xl
          font-semibold
          text-white
        ">
          Connect MetaTrader to unlock your trading analytics.
        </h2>
      </section>
    );
  }


  const metrics =
    data.metrics;


  if (!metrics) {
    return null;
  }


  const currency =
    data.connection
      ?.currency ??
    "USD";


  return (
    <section className="
      relative
      overflow-hidden
      rounded-[30px]
      border
      border-cyan-400/15
      bg-[#07101d]
      p-6
      shadow-2xl
      shadow-cyan-950/20
      md:p-8
    ">

      {/* BACKGROUND */}

      <div className="
        pointer-events-none
        absolute
        -right-32
        -top-32
        h-80
        w-80
        rounded-full
        bg-cyan-400/10
        blur-[100px]
      " />


      {/* HEADER */}

      <div className="
        relative
        flex
        flex-col
        gap-5
        md:flex-row
        md:items-center
        md:justify-between
      ">

        <div>
          <div className="
            flex
            items-center
            gap-3
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
              Live
            </span>
          </div>

          <h2 className="
            mt-3
            text-2xl
            font-semibold
            text-white
          ">
            Trading Performance
          </h2>
        </div>


        <select
          value={range}
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
          {ranges.map(
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
          )}
        </select>
      </div>


      {/* MAIN VALUE */}

      <div className="
        relative
        mt-8
      ">
        <p className="
          text-sm
          text-slate-500
        ">
          Net Performance
        </p>

        <p className={`
          mt-2
          text-4xl
          font-semibold
          tracking-tight
          md:text-5xl

          ${
            metrics.netProfit >=
            0
              ? "text-emerald-300"
              : "text-red-300"
          }
        `}>
          {
            formatMoney(
              metrics.netProfit,
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
            metrics.totalTrades
          } completed trades analyzed
        </p>
      </div>


      {/* METRICS */}

      <div className="
        relative
        mt-8
        grid
        grid-cols-2
        gap-3
        lg:grid-cols-5
      ">

        <MetricCard
          label="Win Rate"
          value={
            `${metrics.winRate.toFixed(
              1
            )}%`
          }
        />


        <MetricCard
          label="Profit Factor"
          value={
            formatProfitFactor(
              metrics.profitFactor
            )
          }
        />


        <MetricCard
          label="Expectancy"
          value={
            formatMoney(
              metrics.expectancy,
              currency
            )
          }
        />


        <MetricCard
          label="Max Drawdown"
          value={
            formatMoney(
              metrics.maxDrawdown,
              currency
            )
          }
        />


        <MetricCard
          label="Best Market"
          value={
            metrics.bestSymbol
              ?.symbol ??
            "—"
          }
          detail={
            metrics.bestSymbol
              ? `${formatMoney(
                  metrics
                    .bestSymbol
                    .netProfit,
                  currency
                )} • ${
                  metrics
                    .bestSymbol
                    .trades
                } trades`
              : undefined
          }
        />
      </div>


      {/* CHART */}

      <div className="
        relative
        mt-8
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.06]
        bg-black/20
        p-4
      ">

        <div className="
          flex
          items-center
          justify-between
        ">
          <div>
            <p className="
              text-sm
              font-medium
              text-slate-200
            ">
              Performance Curve
            </p>

            <p className="
              mt-1
              text-xs
              text-slate-500
            ">
              Cumulative closed-trade P/L
            </p>
          </div>
        </div>


        <PerformanceChart
          points={
            metrics
              .performanceCurve
          }
        />
      </div>


      {/* FOOTER */}

      <div className="
        relative
        mt-6
        flex
        flex-col
        gap-4
        border-t
        border-white/[0.06]
        pt-6
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <p className="
          text-xs
          text-slate-500
        ">
          Last synchronized{" "}
          {
            data.connection
              ?.lastSyncAt
              ? new Date(
                  data.connection
                    .lastSyncAt
                ).toLocaleString()
              : "—"
          }
        </p>


        <Link
          href="/dashboard/advisor"
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
          View Full Analysis

          <span>
            →
          </span>
        </Link>
      </div>
    </section>
  );
}


// ==========================================
// SMALL METRIC CARD
// ==========================================

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;

  value: string;

  detail?: string;
}) {
  return (
    <div className="
      rounded-2xl
      border
      border-white/[0.06]
      bg-white/[0.025]
      p-4
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

      {detail && (
        <p className="
          mt-1
          text-[11px]
          text-slate-500
        ">
          {detail}
        </p>
      )}
    </div>
  );
}