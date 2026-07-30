import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Child Safety & CSAE Policy",
  description:
    "Hangora's Zero Tolerance Policy on Child Sexual Abuse and Exploitation (CSAE), Child Sexual Abuse Material (CSAM), age restrictions, and reporting mechanisms.",
};

export default function ChildSafetyPage() {
  return (
    <LegalPage title="Child Safety & CSAE Policy" updated="July 29, 2026">
      <LegalSection title="1. Overview & Commitment">
        <p>
          Hangora (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to maintaining a safe, respectful, and protected
          environment for all users. We maintain a <strong className="text-white">Zero-Tolerance Policy</strong> against Child Sexual
          Abuse Material (CSAM), Child Sexual Abuse and Exploitation (CSAE), child grooming, or any form of child harm.
        </p>
      </LegalSection>

      <LegalSection title="2. Strict 18+ Age Limitation">
        <p>
          Hangora is exclusively intended for adults aged 18 and older. Minors under the age of 18 are strictly prohibited
          from creating an account, accessing the platform, or using any of our Services.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>We require date of birth verification during account creation.</li>
          <li>Accounts found to belong to minors are immediately suspended and permanently deleted.</li>
          <li>If you suspect an account belongs to someone under 18, please report it immediately.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Prohibition of CSAE and CSAM">
        <p>
          We strictly prohibit the creation, upload, sharing, transmission, storage, or solicitation of any content that depicts,
          encourages, or facilitates child sexual abuse or exploitation. This prohibition applies universally across all media formats:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Profile photos, avatars, and gallery uploads</li>
          <li>One-on-one private chat messages, media, and attachments</li>
          <li>Public hangouts, travel plans, group chats, and invites</li>
          <li>Profile bios, text fields, and user communications</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Proactive Monitoring & Detection">
        <p>To detect and prevent child sexual exploitation and abuse on our platform, we employ a multi-layered safety strategy:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <span className="font-semibold text-white">Automated Photo & Text Filters</span> — Automated technology and hash-matching tools scan uploaded images and messages for known CSAM and inappropriate content.
          </li>
          <li>
            <span className="font-semibold text-white">Dedicated Safety Moderation</span> — Trained moderation teams review flagged accounts, profiles, and reports 24/7.
          </li>
          <li>
            <span className="font-semibold text-white">Behavioral Signals</span> — Accounts demonstrating suspicious interactions or underage indicators are flagged for priority human review.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Reporting Violations & User Safety Tools">
        <p>
          We empower our community with robust tools to report child safety violations or underage accounts immediately:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <span className="font-semibold text-white">In-App Reporting</span> — Tap the options menu (...) on any profile or chat screen and select <strong className="text-white">&quot;Report Profile&quot;</strong> under Safety.
          </li>
          <li>
            <span className="font-semibold text-white">Web & Email Reporting</span> — Contact our Safety Response Team directly at{" "}
            <a href="mailto:safety@hangora.app" className="font-semibold text-vibe-pink hover:underline">
              safety@hangora.app
            </a>
            .
          </li>
        </ul>
        <p className="mt-2 font-medium text-white">
          All child safety reports are treated with maximum priority and investigated immediately.
        </p>
      </LegalSection>

      <LegalSection title="6. Enforcement, Account Termination & Law Enforcement">
        <p>When a violation of our Child Safety &amp; CSAE policy is detected or confirmed:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-white">Instant Account Termination:</strong> The offender&apos;s account is permanently terminated and banned across device, phone, and IP levels.
          </li>
          <li>
            <strong className="text-white">Reporting to NCMEC &amp; Law Enforcement:</strong> In compliance with federal and international child protection laws, we report all instances of CSAM/CSAE to the National Center for Missing &amp; Exploited Children (NCMEC) and appropriate law enforcement authorities.
          </li>
          <li>
            <strong className="text-white">Data Preservation:</strong> Relevant log data and evidence are preserved as required for official law enforcement investigations.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Contact Information">
        <p>
          For child safety concerns, law enforcement inquiries, or urgent safety reports, contact our dedicated Child Safety Officer:
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
          <p className="font-bold">Hangora Child Safety Response Team</p>
          <p className="mt-1 text-sm text-vibe-muted">
            Email:{" "}
            <a href="mailto:safety@hangora.app" className="font-semibold text-vibe-pink hover:underline">
              safety@hangora.app
            </a>
          </p>
          <p className="text-sm text-vibe-muted">Response Time: Priority Handling (24/7 Monitoring)</p>
        </div>
      </LegalSection>
    </LegalPage>
  );
}
