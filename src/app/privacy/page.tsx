import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Vibely collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 21, 2026">
      <LegalSection title="1. Who we are">
        <p>
          Vibely (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a social dating and hangout platform that helps people
          discover connections, join local events, and chat safely. This Privacy Policy explains what
          information we collect and how we use it when you use our website, mobile apps, and related services
          (the &quot;Services&quot;).
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>We may collect:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold text-white">Account details</span> — name, email, phone, password,
            date of birth, gender, and profile preferences.
          </li>
          <li>
            <span className="font-semibold text-white">Profile content</span> — photos, bio, interests, city,
            and other information you choose to share.
          </li>
          <li>
            <span className="font-semibold text-white">Activity data</span> — swipes, matches, hangouts you
            create or join, messages, invites, and social status (e.g. free now).
          </li>
          <li>
            <span className="font-semibold text-white">Device &amp; usage data</span> — IP address, device type,
            app version, crash logs, and approximate location if you allow it.
          </li>
          <li>
            <span className="font-semibold text-white">Communications</span> — support messages and feedback you
            send us.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Create and manage your account</li>
          <li>Show relevant people, hangouts, events, and travel plans near you</li>
          <li>Enable matching, messaging, and invites</li>
          <li>Improve safety, prevent fraud, and enforce our Terms</li>
          <li>Send important service updates (and marketing only if you opt in)</li>
          <li>Analyze product performance and fix bugs</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Sharing">
        <p>
          We do not sell your personal information. We may share data with trusted service providers (hosting,
          analytics, email, payments) who process it for us under contract; with other users as part of your
          public profile and interactions; or when required by law, safety, or to protect rights.
        </p>
      </LegalSection>

      <LegalSection title="5. Your choices">
        <p>
          You can update profile details in the app, control location permissions on your device, and request
          account deletion by contacting us. You may also opt out of non-essential marketing emails.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention &amp; security">
        <p>
          We keep your data only as long as needed for the Services and legal obligations. We use reasonable
          technical and organizational measures to protect information, but no method of transmission is 100%
          secure.
        </p>
      </LegalSection>

      <LegalSection title="7. Children">
        <p>
          Vibely is for users aged 18 and above. We do not knowingly collect data from anyone under 18. If you
          believe a minor has created an account, contact us and we will remove it.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          We may update this Privacy Policy from time to time. We will post the revised version on this page
          and update the &quot;Last updated&quot; date. Continued use of the Services means you accept the
          updated policy.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          For privacy questions or requests, email us at{" "}
          <a href="mailto:privacy@vibely.app" className="font-semibold text-vibe-pink hover:underline">
            privacy@vibely.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
