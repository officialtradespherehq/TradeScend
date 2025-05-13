"use client"

import Link from "next/link"
import { TrendingUp, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import ParticleBackground from "@/components/3d/particle-background"
import AnimatedGradientBackground from "@/components/animations/animated-gradient-background"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
     
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">Privacy Policy</h1>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border mb-8">
              <p className="text-muted-foreground mb-4">Last Updated: May 3, 2025</p>
              <p className="text-muted-foreground">
                This Privacy Policy describes how TradeScend collects, uses, and discloses your personal information
                when you use our platform. We are committed to protecting your privacy and ensuring the security of your
                personal information.
              </p>
            </div>

            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>1.1 Personal Information</strong>
                  </p>
                  <p>We collect personal information that you provide directly to us when you:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create an account (name, email address, phone number, date of birth)</li>
                    <li>
                      Complete our KYC (Know Your Customer) process (government-issued ID, proof of address, tax
                      identification number)
                    </li>
                    <li>
                      Make deposits or withdrawals (payment information, bank account details, cryptocurrency wallet
                      addresses)
                    </li>
                    <li>Contact our customer support (communication records, support tickets)</li>
                    <li>Subscribe to our newsletter or marketing communications</li>
                    <li>Participate in surveys, contests, or promotions</li>
                  </ul>

                  <p>
                    <strong>1.2 Automatically Collected Information</strong>
                  </p>
                  <p>
                    When you use our Services, we automatically collect certain information about your device and usage,
                    including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Device information (IP address, browser type, operating system, device identifiers)</li>
                    <li>Usage data (pages visited, time spent on pages, links clicked, trading activity)</li>
                    <li>Location information (based on IP address or if you enable location services)</li>
                    <li>Cookies and similar tracking technologies (as described in our Cookie Policy)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We use the information we collect for various purposes, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Providing and maintaining our Services</li>
                    <li>Processing your transactions and managing your account</li>
                    <li>Verifying your identity and complying with legal obligations</li>
                    <li>Detecting and preventing fraud, money laundering, and other illegal activities</li>
                    <li>Communicating with you about your account, updates, and promotional offers</li>
                    <li>Analyzing usage patterns to improve our Services</li>
                    <li>Providing customer support</li>
                    <li>Enforcing our Terms of Service and other policies</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Legal Basis for Processing</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We process your personal information based on one or more of the following legal grounds:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Performance of a contract:</strong> Processing is necessary to fulfill our contractual
                      obligations to you under our Terms of Service.
                    </li>
                    <li>
                      <strong>Legitimate interests:</strong> Processing is necessary for our legitimate business
                      interests, such as fraud prevention, improving our Services, and marketing.
                    </li>
                    <li>
                      <strong>Compliance with legal obligations:</strong> Processing is necessary to comply with
                      applicable laws and regulations, including KYC, AML, and tax reporting requirements.
                    </li>
                    <li>
                      <strong>Consent:</strong> In some cases, we process your personal information based on your
                      consent, which you can withdraw at any time.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. How We Share Your Information</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We may share your personal information with the following categories of recipients:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Service providers:</strong> Third-party vendors who provide services on our behalf, such
                      as payment processors, KYC verification providers, cloud hosting providers, and customer support
                      tools.
                    </li>
                    <li>
                      <strong>Financial institutions:</strong> Banks and payment service providers that facilitate
                      transactions on our platform.
                    </li>
                    <li>
                      <strong>Affiliates:</strong> Our subsidiaries and affiliated companies that help us provide our
                      Services.
                    </li>
                    <li>
                      <strong>Legal and regulatory authorities:</strong> Government agencies, law enforcement, and
                      regulatory bodies when required by law or to protect our rights.
                    </li>
                    <li>
                      <strong>Business partners:</strong> Strategic partners with whom we offer co-branded services or
                      joint marketing promotions.
                    </li>
                    <li>
                      <strong>Professional advisors:</strong> Accountants, lawyers, auditors, and other professional
                      advisors in connection with the Accountants, lawyers, auditors, and other professional advisors in
                      connection with the professional services they provide to us.
                    </li>
                    <li>
                      <strong>Business transfers:</strong> In connection with any merger, sale of company assets,
                      financing, or acquisition of all or a portion of our business by another company.
                    </li>
                  </ul>
                  <p>We do not sell your personal information to third parties for their own marketing purposes.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. International Transfers</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We operate globally and may transfer your personal information to countries other than your country
                    of residence, including the United States and other countries where we or our service providers have
                    operations. These countries may have different data protection laws than your country.
                  </p>
                  <p>
                    When we transfer your personal information internationally, we implement appropriate safeguards in
                    accordance with applicable law, such as standard contractual clauses, to ensure that your
                    information receives an adequate level of protection.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We retain your personal information for as long as necessary to fulfill the purposes for which we
                    collected it, including for the purposes of satisfying any legal, regulatory, accounting, or
                    reporting requirements.
                  </p>
                  <p>
                    To determine the appropriate retention period for personal information, we consider the amount,
                    nature, and sensitivity of the personal information, the potential risk of harm from unauthorized
                    use or disclosure, the purposes for which we process the personal information, and whether we can
                    achieve those purposes through other means, as well as applicable legal requirements.
                  </p>
                  <p>
                    In some circumstances, we may anonymize your personal information so that it can no longer be
                    associated with you, in which case we may use such information without further notice to you.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights and Choices</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Depending on your location, you may have certain rights regarding your personal information,
                    including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Access:</strong> You can request a copy of the personal information we hold about you.
                    </li>
                    <li>
                      <strong>Correction:</strong> You can request that we correct inaccurate or incomplete personal
                      information.
                    </li>
                    <li>
                      <strong>Deletion:</strong> You can request that we delete your personal information in certain
                      circumstances.
                    </li>
                    <li>
                      <strong>Restriction:</strong> You can request that we restrict the processing of your personal
                      information in certain circumstances.
                    </li>
                    <li>
                      <strong>Data portability:</strong> You can request a copy of your personal information in a
                      structured, commonly used, and machine-readable format.
                    </li>
                    <li>
                      <strong>Objection:</strong> You can object to our processing of your personal information in
                      certain circumstances.
                    </li>
                    <li>
                      <strong>Withdrawal of consent:</strong> If we process your personal information based on your
                      consent, you can withdraw your consent at any time.
                    </li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us using the information provided in the "Contact Us"
                    section below. We may need to verify your identity before responding to your request.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Security</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal information
                    against unauthorized access, disclosure, alteration, or destruction. These measures include
                    encryption, access controls, regular security assessments, and employee training.
                  </p>
                  <p>
                    However, no method of transmission over the Internet or electronic storage is 100% secure.
                    Therefore, while we strive to use commercially acceptable means to protect your personal
                    information, we cannot guarantee its absolute security.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Our Services are not intended for individuals under the age of 18. We do not knowingly collect
                    personal information from children under 18. If you are a parent or guardian and believe that your
                    child has provided us with personal information, please contact us, and we will take steps to delete
                    such information.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Cookies and Tracking Technologies</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We use cookies and similar tracking technologies to collect information about your browsing
                    activities on our website. Cookies are small text files that are stored on your device when you
                    visit a website.
                  </p>
                  <p>We use the following types of cookies:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Essential cookies:</strong> These cookies are necessary for the website to function
                      properly and cannot be turned off in our systems.
                    </li>
                    <li>
                      <strong>Performance cookies:</strong> These cookies allow us to count visits and traffic sources
                      so we can measure and improve the performance of our site.
                    </li>
                    <li>
                      <strong>Functional cookies:</strong> These cookies enable the website to provide enhanced
                      functionality and personalization.
                    </li>
                    <li>
                      <strong>Targeting cookies:</strong> These cookies may be set through our site by our advertising
                      partners to build a profile of your interests and show you relevant ads on other sites.
                    </li>
                  </ul>
                  <p>
                    You can control cookies through your browser settings. However, if you disable certain cookies, some
                    parts of our website may not function properly.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Privacy Policy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for other
                    operational, legal, or regulatory reasons. We will notify you of any material changes by posting the
                    updated Privacy Policy on our website and updating the "Last Updated" date at the top of this
                    policy.
                  </p>
                  <p>
                    We encourage you to review this Privacy Policy periodically to stay informed about how we are
                    protecting your information.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy
                    practices, please contact us at:
                  </p>
                  <p>
                    TradeScend Inc.
                    <br />
                    Attn: Privacy Officer
                    <br />
                    123 Trading Street
                    <br />
                    Financial District
                    <br />
                    New York, NY 10004
                    <br />
                    Email: officialTradeScendhq@gmail.com
                  </p>
                  <p>
                    If you are not satisfied with our response to your complaint, you may have the right to lodge a
                    complaint with a data protection authority in your country of residence.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      
    </div>
  )
}
