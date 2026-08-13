import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Tracker collects, uses, and protects personal information.",
};
const sections: LegalSection[] = [
  {
    title: "Information we collect",
    items: [
      "Account information such as your name, email address, profile image, preferences, and verification status.",
      "Workspace content such as projects, memberships, time entries, descriptions, rates, reports, invitations, and shared-link settings.",
      "Technical and security data such as session identifiers, browser information, IP address where appropriate, audit events, and service diagnostics.",
      "Communications and support information you choose to send us.",
    ],
  },
  {
    title: "How we use information",
    items: [
      "Provide authentication, time tracking, collaboration, reporting, sharing, and account-management features.",
      "Deliver verification, password-reset, invitation, and service emails.",
      "Secure accounts, enforce permissions, prevent abuse, and investigate incidents.",
      "Maintain, troubleshoot, analyze, and improve Tracker.",
      "Comply with legal obligations and enforce our Terms of Service.",
    ],
  },
  {
    title: "How information is shared",
    paragraphs: [
      "We do not sell your personal information. Information is shared with other workspace members according to project roles and permissions, and with people who receive a public report link according to the controls selected by the report creator.",
      "We use service providers to operate Tracker, including infrastructure, database, authentication, email-delivery, and file-storage providers. They process information on our behalf under appropriate contractual and security obligations. Information may also be disclosed when required by law or to protect rights and safety.",
    ],
  },
  {
    title: "Cookies and sessions",
    paragraphs: [
      "Tracker uses essential cookies and similar storage to maintain secure sessions, remember preferences, and protect authenticated areas. These technologies are necessary for the service to function. We do not use them to sell personal information.",
    ],
  },
  {
    title: "Retention",
    paragraphs: [
      "We retain information while your account or workspace requires it and as reasonably necessary for security, backup, audit, dispute-resolution, and legal purposes. Deactivation may preserve historical project and time records so organizations retain an accurate work history. Public report links can be revoked by their creator.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "Tracker uses measures designed to protect information, including server-side authorization, secure session cookies, token hashing, access controls, audit records, and encrypted transport. No online service can guarantee absolute security, so you should also protect your credentials and sharing links.",
    ],
  },
  {
    title: "Your choices and rights",
    items: [
      "Review and update available profile and preference information.",
      "Control project membership, invitations, and public report links where your role permits.",
      "Request access, correction, deletion, restriction, or portability where applicable law provides those rights.",
      "Deactivate your account, subject to legitimate retention needs for shared workspace records.",
    ],
  },
  {
    title: "International processing and children",
    paragraphs: [
      "Tracker and its service providers may process information in countries other than yours. Where required, we use appropriate safeguards for those transfers.",
      "Tracker is intended for professional use and is not directed to children under 13 or the minimum age required by local law. We do not knowingly collect children’s personal information.",
    ],
  },
  {
    title: "Updates and contact",
    paragraphs: [
      "We may update this policy as Tracker changes. Material updates will be communicated through the service or another reasonable channel. Privacy questions and rights requests can be sent to privacy@tracker.abdulwadood.com.",
    ],
  },
];
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what information Tracker handles, why we use it, and the choices available to you."
      sections={sections}
    />
  );
}
