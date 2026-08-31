import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">

      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-20">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-6 leading-8 text-gray-400">
          This Privacy Policy explains how ElAlgo collects, uses,
          stores and protects information when you use our website,
          products, services, customer dashboard, educational
          content and custom development services.
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Last updated: August 2026
        </p>


        <div className="mt-12 space-y-10">

          <Section
            title="1. Information We Collect"
            text="
              We may collect information that you provide directly
              when creating an account, submitting a custom project,
              purchasing or activating a product, contacting support,
              or otherwise using ElAlgo services.
            "
          />

          <Section
            title="2. Account Information"
            text="
              When you create an ElAlgo account, we may store
              information such as your email address, profile name,
              account identifier and other profile information
              associated with your account.
            "
          />

          <Section
            title="3. Custom Project Information"
            text="
              When you submit a custom development request, we may
              collect project titles, strategy descriptions, entry and
              exit rules, risk-management requirements, platform
              preferences, budget information, delivery preferences
              and other project details that you choose to provide.
            "
          />

          <Section
            title="4. Uploaded Project Files"
            text="
              Customers may upload supporting files such as images,
              documents, source-code files, strategy descriptions or
              other project materials. These files may contain
              confidential or proprietary information and are stored
              for the purpose of reviewing and delivering the
              requested service.
            "
          />

          <Section
            title="5. Product and License Information"
            text="
              When you use licensed ElAlgo products, we may store
              information required to provide and protect the license,
              including the license key, product identifier,
              MetaTrader account number, license status, activation
              information, expiration information and verification
              timestamps.
            "
          />

          <Section
            title="6. Technical Information"
            text="
              We may receive limited technical information associated
              with use of the website or services, such as browser
              information, device information, request logs,
              timestamps, error information and other data needed for
              security, reliability and troubleshooting.
            "
          />

          <Section
            title="7. How We Use Information"
            text="
              We use collected information to operate the website,
              provide customer accounts, deliver products and
              licenses, review custom development requests, provide
              customer support, improve our services, prevent abuse,
              maintain security and communicate important service
              information.
            "
          />

          <Section
            title="8. Strategy Confidentiality"
            text="
              Trading strategies and custom project materials
              submitted to ElAlgo are treated as confidential project
              information. We do not intentionally publish, sell or
              reuse a customer's private trading strategy as an ElAlgo
              product without the customer's permission.
            "
          />

          <Section
            title="9. Service Providers"
            text="
              ElAlgo may use third-party infrastructure and service
              providers to operate parts of the website and services.
              These providers may process information only as needed
              to provide their respective services. For example,
              ElAlgo currently uses infrastructure services for
              authentication, database storage, file storage and
              website hosting.
            "
          />

          <Section
            title="10. Payments"
            text="
              When online payments are introduced, payment
              information may be processed by third-party payment
              providers. ElAlgo does not intend to directly store full
              payment-card details unless explicitly required and
              handled through appropriate secure infrastructure.
            "
          />

          <Section
            title="11. Data Security"
            text="
              We take reasonable technical and organizational measures
              to protect information against unauthorized access,
              loss, misuse or disclosure. However, no internet-based
              system can guarantee absolute security.
            "
          />

          <Section
            title="12. Data Retention"
            text="
              We may retain account, project, licensing and service
              information for as long as reasonably necessary to
              provide services, maintain records, resolve disputes,
              protect against abuse and comply with applicable legal
              obligations.
            "
          />

          <Section
            title="13. Your Responsibilities"
            text="
              You are responsible for protecting your account
              credentials and for ensuring that information or files
              you submit to ElAlgo are information you are authorized
              to provide.
            "
          />

          <Section
            title="14. Third-Party Links"
            text="
              ElAlgo may link to third-party websites or services such
              as YouTube, Telegram, WhatsApp, brokers or other external
              resources. Their privacy practices are governed by
              their own policies and are outside ElAlgo's control.
            "
          />

          <Section
            title="15. Changes to This Policy"
            text="
              This Privacy Policy may be updated as ElAlgo develops
              new features, integrations or services. The latest
              version will be published on this page.
            "
          />

          <Section
            title="16. Contact"
            text="
              If you have questions about this Privacy Policy or the
              way your information is handled, you may contact ElAlgo
              through the contact methods provided on the website.
            "
          />

        </div>


        <div className="mt-14 rounded-3xl border border-blue-500/20 bg-blue-500/[0.04] p-8">

          <h2 className="text-xl font-bold text-white">
            Your Project Information Matters
          </h2>

          <p className="mt-4 leading-7 text-gray-400">
            Custom trading strategies can represent valuable
            intellectual property. ElAlgo is designed to keep
            customer project information connected to authenticated
            accounts and controlled access rather than exposing it
            publicly.
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