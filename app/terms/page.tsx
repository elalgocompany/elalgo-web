import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">

      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-20">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
          Terms & Conditions
        </h1>

        <p className="mt-6 leading-8 text-gray-400">
          These Terms & Conditions govern your use of the ElAlgo
          website, products, software licenses, educational content,
          customer dashboard and custom development services.
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Last updated: August 2026
        </p>


        <div className="mt-12 space-y-10">

          <Section
            title="1. Acceptance of Terms"
            text="
              By accessing the ElAlgo website, creating an account,
              purchasing or using a product, submitting a custom
              development request, or otherwise using ElAlgo services,
              you agree to these Terms & Conditions and the applicable
              Risk Disclosure and Privacy Policy.
            "
          />

          <Section
            title="2. ElAlgo Services"
            text="
              ElAlgo provides algorithmic trading software, Expert
              Advisors, indicators, trading assistants, educational
              materials, licensing services and custom software
              development for trading platforms such as MetaTrader
              and TradingView.
            "
          />

          <Section
            title="3. User Accounts"
            text="
              Some ElAlgo services require an account. You are
              responsible for maintaining the confidentiality of your
              account credentials and for activity performed through
              your account. You must provide accurate information and
              must not use another person's account without
              authorization.
            "
          />

          <Section
            title="4. Software Licenses"
            text="
              Paid ElAlgo products may be provided under a software
              license. Unless otherwise stated for a particular
              product, a license grants you a limited, personal,
              non-transferable right to use the software according to
              the applicable product and license terms.
            "
          />

          <Section
            title="5. License Keys and Account Binding"
            text="
              Certain ElAlgo products may use license keys, MetaTrader
              account numbers, activation records or other technical
              controls to verify authorized use. You must not share,
              resell, bypass, manipulate or attempt to defeat licensing
              or access-control mechanisms.
            "
          />

          <Section
            title="6. Free and Trial Products"
            text="
              ElAlgo may provide free products or trial access at its
              discretion. Trial periods, activation limits, supported
              platforms and other restrictions may vary by product.
              Trial access does not create a right to continued use
              after the applicable trial period or limitation ends.
            "
          />

          <Section
            title="7. Custom Development Requests"
            text="
              Submitting a project request does not automatically
              create a development contract or payment obligation.
              ElAlgo may first review the submitted requirements,
              request additional information and provide a proposal
              containing the project scope, estimated delivery time,
              price and other relevant terms.
            "
          />

          <Section
            title="8. Project Scope"
            text="
              Custom development is performed according to the scope
              agreed between ElAlgo and the customer. Features,
              requirements or changes that were not part of the agreed
              scope may require additional development time, pricing or
              a revised agreement.
            "
          />

          <Section
            title="9. Customer Requirements"
            text="
              Customers are responsible for providing clear, accurate
              and complete project requirements. Delays caused by
              missing information, changing requirements, unavailable
              files, platform limitations or delayed customer responses
              may affect the estimated delivery schedule.
            "
          />

          <Section
            title="10. Testing and Approval"
            text="
              ElAlgo may demonstrate or test custom projects using
              Strategy Tester, demo environments, protected test
              versions or other reasonable testing methods. Customers
              are responsible for reviewing the delivered functionality
              and reporting reproducible issues within any agreed
              testing or support period.
            "
          />

          <Section
            title="11. Source Code and Deliverables"
            text="
              The files and source code included in a custom project
              are determined by the applicable project agreement.
              Source-code delivery should not be assumed unless it is
              included in the agreed project scope or proposal.
            "
          />

          <Section
            title="12. Intellectual Property"
            text="
              Customers retain their rights in original trading
              strategies, specifications and materials they provide to
              ElAlgo. ElAlgo retains rights in its pre-existing tools,
              libraries, licensing systems, reusable components,
              frameworks, methods and other intellectual property unless
              otherwise agreed in writing.
            "
          />

          <Section
            title="13. Confidentiality"
            text="
              ElAlgo treats private customer strategies and custom
              project materials as confidential project information.
              Customers must also respect any confidential or
              proprietary ElAlgo code, systems, test builds or materials
              provided during a project.
            "
          />

          <Section
            title="14. Payments"
            text="
              Prices and payment arrangements are determined by the
              applicable product, proposal or custom development
              agreement. Custom projects may require deposits or
              milestone payments before development, testing or final
              delivery. Any applicable payment schedule should be
              communicated before the relevant work begins.
            "
          />

          <Section
            title="15. Refunds"
            text="
              Refund eligibility depends on the nature of the product
              or service, the work already performed, the applicable
              project agreement and any specific refund terms presented
              before purchase. Custom development payments may be
              non-refundable once the corresponding development work
              has been performed, except where otherwise agreed or
              required by applicable law.
            "
          />

          <Section
            title="16. No Trading Guarantee"
            text="
              ElAlgo develops and provides software functionality.
              ElAlgo does not guarantee that a product, strategy,
              Expert Advisor or custom trading system will generate
              profits or avoid losses. A correctly implemented trading
              strategy can still produce financial losses.
            "
          />

          <Section
            title="17. Educational Information"
            text="
              Tutorials, videos, articles and other educational content
              are provided for informational purposes only and do not
              constitute personalized financial, investment, legal or
              tax advice.
            "
          />

          <Section
            title="18. Prohibited Use"
            text="
              You may not use ElAlgo services to engage in unlawful
              activity, distribute malicious software, interfere with
              ElAlgo infrastructure, gain unauthorized access to
              accounts or systems, copy or redistribute protected
              software without permission, or attempt to bypass product
              licensing and security controls.
            "
          />

          <Section
            title="19. Service Availability"
            text="
              ElAlgo does not guarantee uninterrupted availability of
              the website, licensing servers, downloads, dashboards or
              other online services. Maintenance, infrastructure
              problems, third-party outages or other technical events
              may temporarily affect availability.
            "
          />

          <Section
            title="20. Limitation of Liability"
            text="
              To the extent permitted by applicable law, ElAlgo is not
              responsible for trading losses, lost profits, indirect
              losses, broker actions, market events, platform failures,
              internet outages, incorrect customer settings or other
              losses resulting from trading activity or circumstances
              outside ElAlgo's reasonable control.
            "
          />

          <Section
            title="21. Third-Party Services"
            text="
              ElAlgo may integrate with or link to third-party
              platforms and services such as MetaTrader, TradingView,
              YouTube, hosting providers, payment processors, brokers,
              Telegram or WhatsApp. ElAlgo is not responsible for the
              availability, terms or operation of independent
              third-party services.
            "
          />

          <Section
            title="22. Changes to Products and Services"
            text="
              ElAlgo may improve, modify, replace or discontinue
              website features, products or services when reasonably
              necessary. Material contractual rights already agreed for
              a specific paid custom project remain subject to that
              project's agreement.
            "
          />

          <Section
            title="23. Changes to These Terms"
            text="
              These Terms & Conditions may be updated from time to
              time as ElAlgo products, services or legal requirements
              change. The latest version will be published on this
              page.
            "
          />

          <Section
            title="24. Contact"
            text="
              Questions regarding these Terms & Conditions may be sent
              through the contact methods provided on the ElAlgo
              website.
            "
          />

        </div>


        {/* IMPORTANT NOTICE */}

        <div className="mt-14 rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-8">

          <h2 className="text-xl font-bold text-white">
            Custom Projects Are Agreed Individually
          </h2>

          <p className="mt-4 leading-7 text-gray-400">
            For custom development, the specific project proposal or
            agreement should define the functionality, deliverables,
            price, payment milestones, estimated delivery period,
            testing process and any project-specific conditions.
            Where a project-specific agreement conflicts with these
            general terms, the project-specific agreement should
            control for that project.
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