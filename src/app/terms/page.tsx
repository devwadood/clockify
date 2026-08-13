import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing access to and use of Tracker.",
};
const sections: LegalSection[] = [
  {
    title: "Agreement and eligibility",
    paragraphs: [
      "These Terms of Service govern your access to Tracker, including its time tracking, project collaboration, reporting, and sharing features. By creating an account or using the service, you agree to these terms.",
      "You must be legally able to enter into this agreement. If you use Tracker for an organization, you confirm that you have authority to accept these terms on its behalf.",
    ],
  },
  {
    title: "Accounts and security",
    items: [
      "Provide accurate account information and keep it current.",
      "Protect your password, email account, sessions, and invitation links.",
      "Tell us promptly if you suspect unauthorized access.",
      "You are responsible for activity performed through your account unless caused by our failure to apply reasonable security controls.",
    ],
  },
  {
    title: "Your workspace and content",
    paragraphs: [
      "You retain ownership of project information, time entries, reports, and other content submitted to Tracker. You grant us the limited permission needed to host, process, display, secure, and transmit that content solely to operate and improve the service.",
      "Workspace owners and administrators control member access. Their actions may affect your access to projects, entries, reports, and shared links.",
    ],
  },
  {
    title: "Acceptable use",
    items: [
      "Do not use Tracker for unlawful, fraudulent, abusive, or harmful activity.",
      "Do not attempt to bypass authorization, probe the service, introduce malicious code, or disrupt other users.",
      "Do not upload content you lack the right to use or that infringes another person’s rights.",
      "Do not misuse public report links or invitations to expose confidential information.",
    ],
  },
  {
    title: "Service availability and changes",
    paragraphs: [
      "We aim to provide a reliable service, but uninterrupted availability is not guaranteed. Features may change as Tracker evolves. We may perform maintenance, address security risks, or limit functionality when reasonably necessary.",
    ],
  },
  {
    title: "Suspension and termination",
    paragraphs: [
      "You may stop using Tracker at any time and may use available account-deactivation controls. We may suspend or terminate access for material violations, security threats, unlawful use, or where required by law. Where practical, we will provide notice and an opportunity to resolve the issue.",
    ],
  },
  {
    title: "Intellectual property",
    paragraphs: [
      "Tracker, its software, branding, interface, and documentation are protected by applicable intellectual-property laws. These terms provide a limited right to use the service; they do not transfer ownership of Tracker technology or branding.",
    ],
  },
  {
    title: "Disclaimers and liability",
    paragraphs: [
      "Tracker is provided on an “as available” basis to the extent permitted by law. Reports and financial calculations depend on information supplied by users and should be reviewed before being used for invoicing, payroll, tax, legal, or accounting decisions.",
      "To the maximum extent permitted by law, Tracker is not liable for indirect, incidental, special, consequential, or lost-profit damages arising from use of the service. Nothing in these terms excludes liability that cannot lawfully be excluded.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update these terms to reflect product, legal, or operational changes. Material updates will be communicated through the service or another reasonable channel. Continued use after an update takes effect constitutes acceptance of the revised terms.",
    ],
  },
];
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms explain the rules and responsibilities that apply when you use Tracker. Please read them carefully."
      sections={sections}
    />
  );
}
