"use client"

import Link from "next/link"
import { TrendingUp, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import ParticleBackground from "@/components/3d/particle-background"
import AnimatedGradientBackground from "@/components/animations/animated-gradient-background"

export default function TermsPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">Terms of Service</h1>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border mb-8">
              <p className="text-muted-foreground mb-4">Last Updated: May 3, 2025</p>
              <p className="text-muted-foreground">
                Please read these Terms of Service carefully before using the TradeScend platform. By accessing or
                using our services, you agree to be bound by these terms.
              </p>
            </div>

            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    These Terms of Service ("Terms") govern your access to and use of the TradeScend platform,
                    including our website, mobile applications, and all related services (collectively, the "Services").
                    The Services are provided by TradeScend Inc. ("TradeScend," "we," "us," or "our").
                  </p>
                  <p>
                    By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to
                    these Terms, you may not access or use the Services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Eligibility</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    To use the Services, you must be at least 18 years old and have the legal capacity to enter into a
                    binding agreement. By using the Services, you represent and warrant that you meet these
                    requirements.
                  </p>
                  <p>
                    The Services are not available to residents of certain jurisdictions where trading in
                    cryptocurrencies or copy trading is prohibited or restricted. It is your responsibility to ensure
                    that your use of the Services complies with the laws and regulations applicable in your
                    jurisdiction.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Account Registration</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    To access certain features of the Services, you must create an account. When you create an account,
                    you agree to provide accurate, current, and complete information about yourself. You are responsible
                    for maintaining the confidentiality of your account credentials and for all activities that occur
                    under your account.
                  </p>
                  <p>
                    You agree to immediately notify us of any unauthorized use of your account or any other breach of
                    security. We will not be liable for any loss or damage arising from your failure to comply with this
                    section.
                  </p>
                  <p>
                    We reserve the right to suspend or terminate your account if any information provided during the
                    registration process or thereafter proves to be inaccurate, false, or misleading, or if you fail to
                    comply with these Terms.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Know Your Customer (KYC) and Anti-Money Laundering (AML) Compliance
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    To comply with applicable laws and regulations, we may require you to provide additional information
                    or documents to verify your identity, source of funds, or other information related to your use of
                    the Services. This process is known as Know Your Customer (KYC).
                  </p>
                  <p>
                    You agree to provide all information and documents requested for KYC purposes promptly and
                    accurately. Failure to provide such information or documents may result in the suspension or
                    termination of your account or restrictions on your ability to use the Services.
                  </p>
                  <p>
                    We reserve the right to report suspicious activities to relevant authorities in accordance with
                    applicable Anti-Money Laundering (AML) laws and regulations.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Investment Services and Risks</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>5.1 Copy Trading Services</strong>
                  </p>
                  <p>
                    TradeScend provides copy trading services that allow you to automatically copy trades executed by
                    other traders ("Expert Traders"). By using our copy trading services, you authorize us to open and
                    close trades on your behalf based on the trades executed by the Expert Traders you choose to follow.
                  </p>
                  <p>
                    <strong>5.2 Investment Plans</strong>
                  </p>
                  <p>
                    TradeScend offers various investment plans with different minimum investment amounts, durations,
                    and estimated returns. The specific terms of each investment plan are described on our website and
                    may be updated from time to time.
                  </p>
                  <p>
                    <strong>5.3 Risk Disclosure</strong>
                  </p>
                  <p>
                    Trading in cryptocurrencies, stocks, and other financial instruments involves significant risks,
                    including the risk of loss of your entire investment. Past performance is not indicative of future
                    results, and the performance of Expert Traders may vary over time.
                  </p>
                  <p>
                    The estimated returns provided for our investment plans are based on historical data and are not
                    guaranteed. Actual returns may be higher or lower than the estimated returns.
                  </p>
                  <p>
                    You should carefully consider your investment objectives, level of experience, and risk appetite
                    before using our Services. You should not invest money that you cannot afford to lose.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Fees and Payments</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>6.1 Fee Structure</strong>
                  </p>
                  <p>
                    We charge fees for the use of our Services as described on our website. The fee structure may
                    include subscription fees, performance fees, withdrawal fees, and other charges. We reserve the
                    right to change our fee structure at any time by posting the updated fees on our website.
                  </p>
                  <p>
                    <strong>6.2 Payment Methods</strong>
                  </p>
                  <p>
                    We accept various payment methods, including credit/debit cards, bank transfers, and
                    cryptocurrencies. The availability of payment methods may vary depending on your location.
                  </p>
                  <p>
                    <strong>6.3 Taxes</strong>
                  </p>
                  <p>
                    You are solely responsible for determining what, if any, taxes apply to your transactions on the
                    Services. It is your responsibility to report and remit the correct tax to the appropriate tax
                    authority. We are not responsible for determining whether taxes apply to your transactions or for
                    collecting, reporting, withholding, or remitting any taxes arising from any transactions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Withdrawals</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    You may withdraw funds from your account subject to the terms of your investment plan and our
                    withdrawal policies. Withdrawal requests are processed within the timeframes specified on our
                    website, which may vary depending on the withdrawal method.
                  </p>
                  <p>
                    We reserve the right to delay or refuse withdrawals if we suspect fraudulent activity, if you have
                    not complied with our KYC requirements, or for other legitimate reasons.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Intellectual Property</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    The Services and all content, features, and functionality thereof, including but not limited to all
                    information, software, text, displays, images, video, and audio, and the design, selection, and
                    arrangement thereof, are owned by TradeScend, its licensors, or other providers of such material
                    and are protected by copyright, trademark, patent, trade secret, and other intellectual property or
                    proprietary rights laws.
                  </p>
                  <p>
                    These Terms permit you to use the Services for your personal, non-commercial use only. You must not
                    reproduce, distribute, modify, create derivative works of, publicly display, publicly perform,
                    republish, download, store, or transmit any of the material on our Services, except as follows:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Your computer may temporarily store copies of such materials in RAM incidental to your accessing
                      and viewing those materials.
                    </li>
                    <li>
                      You may store files that are automatically cached by your Web browser for display enhancement
                      purposes.
                    </li>
                    <li>
                      You may print or download one copy of a reasonable number of pages of the website for your own
                      personal, non-commercial use and not for further reproduction, publication, or distribution.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Prohibited Uses</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    You may use the Services only for lawful purposes and in accordance with these Terms. You agree not
                    to use the Services:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      In any way that violates any applicable federal, state, local, or international law or regulation.
                    </li>
                    <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                    <li>
                      To send, knowingly receive, upload, download, use, or re-use any material that does not comply
                      with these Terms.
                    </li>
                    <li>
                      To transmit, or procure the sending of, any advertising or promotional material, including any
                      "junk mail," "chain letter," "spam," or any other similar solicitation.
                    </li>
                    <li>
                      To impersonate or attempt to impersonate TradeScend, a TradeScend employee, another user, or any
                      other person or entity.
                    </li>
                    <li>
                      To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the
                      Services, or which, as determined by us, may harm TradeScend or users of the Services or expose
                      them to liability.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    IN NO EVENT WILL TradeScend, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES,
                    AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING
                    OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE SERVICES, INCLUDING ANY DIRECT,
                    INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO,
                    PERSONAL INJURY, PAIN AND SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF
                    BUSINESS OR ANTICIPATED SAVINGS, LOSS OF USE, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER CAUSED BY
                    TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT, OR OTHERWISE, EVEN IF FORESEEABLE.
                  </p>
                  <p>
                    THE FOREGOING DOES NOT AFFECT ANY LIABILITY THAT CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Indemnification</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    You agree to defend, indemnify, and hold harmless TradeScend, its affiliates, licensors, and
                    service providers, and its and their respective officers, directors, employees, contractors, agents,
                    licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages,
                    judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising
                    out of or relating to your violation of these Terms or your use of the Services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  12. Governing Law and Dispute Resolution
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    These Terms and any dispute or claim arising out of or in connection with them or their subject
                    matter or formation (including non-contractual disputes or claims) shall be governed by and
                    construed in accordance with the laws of the jurisdiction in which TradeScend is registered,
                    without giving effect to any choice or conflict of law provision or rule.
                  </p>
                  <p>
                    Any legal suit, action, or proceeding arising out of, or related to, these Terms or the Services
                    shall be instituted exclusively in the courts of the jurisdiction in which TradeScend is
                    registered. You waive any and all objections to the exercise of jurisdiction over you by such courts
                    and to venue in such courts.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to Terms</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may revise and update these Terms from time to time in our sole discretion. All changes are
                    effective immediately when we post them, and apply to all access to and use of the Services
                    thereafter.
                  </p>
                  <p>
                    Your continued use of the Services following the posting of revised Terms means that you accept and
                    agree to the changes. You are expected to check this page frequently so you are aware of any
                    changes, as they are binding on you.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>If you have any questions about these Terms, please contact us at:</p>
                  <p>
                    TradeScend Inc.
                    <br />
                    123 Trading Street
                    <br />
                    Financial District
                    <br />
                    New York, NY 10004
                    <br />
                    Email: officialTradeScendhq@gmail.com
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
