import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                  <p className="text-muted-foreground">
                    Fusion Therapeutics ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our physiotherapy evidence-based practice platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
                  <h3 className="text-xl font-medium mb-2">2.1 Personal Information</h3>
                  <p className="text-muted-foreground mb-2">We may collect the following personal information:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Name and professional credentials</li>
                    <li>Email address</li>
                    <li>Healthcare registration/license number</li>
                    <li>Professional specialization</li>
                    <li>Department and organization details</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-2 mt-4">2.2 Usage Data</h3>
                  <p className="text-muted-foreground mb-2">We automatically collect:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Log data (IP address, browser type, pages visited)</li>
                    <li>Usage statistics and activity tracking</li>
                    <li>Search queries and evidence access patterns</li>
                    <li>Device information</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-2">We use your information to:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Provide and maintain our services</li>
                    <li>Verify healthcare professional credentials</li>
                    <li>Personalize your experience with relevant clinical content</li>
                    <li>Send administrative notifications and updates</li>
                    <li>Improve our platform and develop new features</li>
                    <li>Comply with legal obligations</li>
                    <li>Prevent fraud and ensure security</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
                  <h3 className="text-xl font-medium mb-2">4.1 We DO NOT sell your personal data</h3>
                  <p className="text-muted-foreground mb-2">We may share your information with:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform (e.g., hosting, analytics)</li>
                    <li><strong>Professional Verification:</strong> Healthcare regulatory bodies for credential verification</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
                  <p className="text-muted-foreground">
                    We implement industry-standard security measures including encryption, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure. We maintain comprehensive audit logs for all access to patient data and implement role-based access controls.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
                  <p className="text-muted-foreground">
                    We retain your personal information for as long as your account is active or as needed to provide services. We will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. Patient-related data is retained according to healthcare regulatory requirements.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
                  <p className="text-muted-foreground mb-2">You have the right to:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data (subject to legal requirements)</li>
                    <li>Object to processing of your data</li>
                    <li>Export your data</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">8. GDPR Compliance</h2>
                  <p className="text-muted-foreground">
                    For users in the European Economic Area (EEA), we comply with GDPR requirements. We process your data based on legitimate interests, contractual necessity, or your consent. You have additional rights under GDPR including data portability and the right to lodge a complaint with a supervisory authority.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">9. Patient Data Protection</h2>
                  <p className="text-muted-foreground">
                    We implement stringent security measures for patient data, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Mandatory healthcare professional verification before patient data access</li>
                    <li>Comprehensive audit logging of all patient data access</li>
                    <li>Encrypted storage and transmission</li>
                    <li>Role-based access controls</li>
                    <li>Regular security assessments</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">10. Cookies and Tracking</h2>
                  <p className="text-muted-foreground">
                    We use cookies and similar tracking technologies to track activity and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">11. Children's Privacy</h2>
                  <p className="text-muted-foreground">
                    Our service is intended for healthcare professionals and is not directed to individuals under 18. We do not knowingly collect personal information from children.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">12. Changes to This Privacy Policy</h2>
                  <p className="text-muted-foreground">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">13. Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have questions about this Privacy Policy, please contact us at:
                  </p>
                  <div className="mt-2 text-muted-foreground">
                    <p><strong>Email:</strong> info@fusiontherapeutics.co.uk</p>
                    <p><strong>Fusion Therapeutics</strong></p>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
