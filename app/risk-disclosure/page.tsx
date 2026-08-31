import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RiskDisclosurePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">

      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-20">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
          Risk Disclosure
        </h1>

        <p className="mt-6 leading-8 text-gray-400">
          Trading financial markets involves significant risk.
          Please read this disclosure carefully before using
          any ElAlgo product, Expert Advisor, indicator,
          trading assistant, educational material, or custom
          trading software.
        </p>


        <div className="mt-12 space-y-10">

          <Section
            title="1. Trading Involves Risk"
            text="
              Forex, CFDs, futures, cryptocurrencies and other
              financial instruments can involve a high level of risk.
              You may lose some or all of the capital used for trading.
              You should only trade with funds you can afford to lose.
            "
          />

          <Section
            title="2. No Guaranteed Results"
            text="
              ElAlgo does not guarantee profits, returns, trading
              performance, account growth, or protection from losses.
              Trading results depend on many factors including market
              conditions, broker execution, spreads, slippage,
              liquidity, account settings, strategy parameters and
              user decisions.
            "
          />

          <Section
            title="3. Automated Trading Risk"
            text="
              Expert Advisors and automated trading systems execute
              trading logic according to programmed rules. Automated
              systems may behave differently in live market conditions
              than in backtests or demonstrations.
            "
          />

          <Section
            title="4. Backtesting Is Not Future Performance"
            text="
              Historical tests, simulations, demonstrations and
              Strategy Tester results are provided for evaluation
              purposes only. Past or simulated performance does not
              guarantee future results.
            "
          />

          <Section
            title="5. Technical Risks"
            text="
              Trading software can be affected by internet outages,
              platform errors, server interruptions, hardware
              failures, VPS problems, broker issues, incorrect
              settings, software updates and other technical events.
              Users are responsible for monitoring their trading
              environment.
            "
          />

          <Section
            title="6. Broker Differences"
            text="
              Results may vary between brokers because of differences
              in spreads, commissions, execution speed, symbols,
              contract specifications, pricing, liquidity and trading
              conditions.
            "
          />

          <Section
            title="7. User Responsibility"
            text="
              You are responsible for deciding whether a product or
              trading strategy is appropriate for your financial
              situation and risk tolerance. You are also responsible
              for configuring, monitoring and operating any software
              used on your trading account.
            "
          />

          <Section
            title="8. Educational Content"
            text="
              Educational videos, tutorials, articles and other
              materials published by ElAlgo are provided for
              informational and educational purposes only. They should
              not be interpreted as personalized financial,
              investment, legal or tax advice.
            "
          />

          <Section
            title="9. Custom Development"
            text="
              Custom software is developed according to the rules and
              requirements provided and agreed upon for the project.
              The implementation of a trading strategy does not imply
              that the underlying strategy will be profitable.
            "
          />

          <Section
            title="10. Independent Evaluation"
            text="
              Users should independently test and evaluate any trading
              software before using it with significant capital.
              Demo accounts, controlled testing and appropriate risk
              management are strongly recommended.
            "
          />

        </div>


        <div className="mt-14 rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-8">

          <h2 className="text-xl font-bold text-white">
            Important Notice
          </h2>

          <p className="mt-4 leading-7 text-gray-400">
            By using ElAlgo products or services, you acknowledge
            that you understand the risks associated with trading
            and accept responsibility for your own trading decisions
            and results.
          </p>

        </div>

      </section>

      <Footer />

    </main>
  );
}


type SectionProps = {
  title: string;
  text: string;
};

function Section({
  title,
  text,
}: SectionProps) {
  return (
    <section>

      <h2 className="text-xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-3 leading-8 text-gray-400">
        {text}
      </p>

    </section>
  );
}