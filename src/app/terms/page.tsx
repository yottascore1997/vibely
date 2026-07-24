import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms of use for Vibely — dating, hangouts, and community rules.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="July 21, 2026">
      <LegalSection title="1. Agreement">
        <p>
          By accessing or using Vibely (website, mobile apps, and related services), you agree to these Terms
          &amp; Conditions and our Privacy Policy. If you do not agree, do not use the Services.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 18 years old and legally able to enter a binding agreement. You are responsible
          for keeping your login credentials secure and for activity under your account.
        </p>
      </LegalSection>

      <LegalSection title="3. The Services">
        <p>
          Vibely lets you create a profile, discover people, match, chat, join hangouts and events, share
          social status, and related features. We may change, suspend, or discontinue features at any time.
          Some features may require Premium or other paid plans.
        </p>
      </LegalSection>

      <LegalSection title="4. Your content &amp; conduct">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Post false, misleading, illegal, or harmful content</li>
          <li>Harass, threaten, scam, or exploit other users</li>
          <li>Share others&apos; private information without consent</li>
          <li>Use bots, scrapers, or reverse-engineer the Services</li>
          <li>Impersonate someone else or create fake accounts</li>
          <li>Upload content you do not have rights to</li>
        </ul>
        <p>
          You grant Vibely a worldwide, non-exclusive license to host and display content you upload as needed
          to operate the Services. You remain responsible for your content.
        </p>
      </LegalSection>

      <LegalSection title="5. Safety">
        <p>
          Meeting people offline carries risk. Always meet in public places, tell a friend, and trust your
          instincts. Vibely does not conduct criminal background checks on all users and is not responsible for
          user conduct offline.
        </p>
      </LegalSection>

      <LegalSection title="6. Payments">
        <p>
          If you purchase Premium or other paid features, fees are billed through the app store or payment
          provider you use. Subscriptions renew unless cancelled according to that store&apos;s rules. Fees are
          generally non-refundable except where required by law.
        </p>
      </LegalSection>

      <LegalSection title="7. Termination">
        <p>
          You may delete your account at any time. We may suspend or terminate accounts that violate these
          Terms, harm others, or put the platform at risk, with or without notice.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers">
        <p>
          The Services are provided &quot;as is&quot; without warranties of any kind. We do not guarantee
          matches, hangouts, or uninterrupted availability. To the fullest extent allowed by law, Vibely is not
          liable for indirect, incidental, or consequential damages arising from your use of the Services.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to terms">
        <p>
          We may update these Terms. Continued use after changes means you accept the new Terms. Material
          changes may be highlighted in the app or on this page.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these Terms:{" "}
          <a href="mailto:legal@vibely.app" className="font-semibold text-vibe-pink hover:underline">
            legal@vibely.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
