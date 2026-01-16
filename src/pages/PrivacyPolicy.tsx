import { Header } from "@/components/layout/Header";
import { Footer, Container, Section } from "@/components/layout";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-background">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last Updated: January 2025
            </p>
          </div>
        </Container>
      </section>

      {/* Content Section */}
      <Section className="py-12">
        <Container>
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-foreground leading-relaxed">
                Handledly Moving Services, operated by Handledly Moving Services Inc. ("Company," "we," "our," or "us"), 
                provides moving services through our website at{" "}
                <a href="https://handledly.com" className="text-primary hover:underline">
                  https://handledly.com
                </a>{" "}
                (the "Service"). This Privacy Policy describes how we collect, use, and protect 
                your personal information. By using our Service, you agree to the practices 
                outlined in this policy.
              </p>
            </div>

            {/* Types of Information Collected */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Types of Information Collected</h2>
              <p className="text-foreground mb-4">We collect the following types of personal information:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Name</li>
                <li>Phone number</li>
                <li>Postal address</li>
                <li>Information your browser sends to us (Log Data)</li>
                <li>Cookies and related data</li>
              </ul>
            </div>

            {/* How Information is Collected */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">How Information is Collected</h2>
              <p className="text-foreground leading-relaxed">
                We collect information directly from you when you provide it through forms, 
                during registration, or when contacting us. Additional information, such as 
                Log Data, is automatically collected through your browser or device.
              </p>
            </div>

            {/* Purpose of Data Collection */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Purpose of Data Collection</h2>
              <p className="text-foreground mb-4">The information we collect is used for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>To provide and improve our Service</li>
                <li>To contact or identify you when necessary</li>
                <li>To enhance user experience and analyze website performance</li>
              </ul>
            </div>

            {/* Data Security Measures */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Data Security Measures</h2>
              <p className="text-foreground leading-relaxed">
                We value your trust and strive to use commercially acceptable means to protect 
                your personal information. While no method of transmission over the internet or 
                electronic storage is completely secure, we continuously update our practices to 
                safeguard your data.
              </p>
            </div>

            {/* Data Sharing Practices */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Data Sharing Practices</h2>
              <p className="text-foreground leading-relaxed">
                We do not share your personal information with third parties for marketing purposes. 
                Any information shared with third-party service providers is strictly for facilitating 
                our Service, and these providers are obligated not to disclose or use the information 
                for other purposes.
              </p>
            </div>

            {/* User Rights */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">User Rights</h2>
              <p className="text-foreground mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Access the personal information we hold about you</li>
                <li>Request corrections or updates to your personal information</li>
                <li>Opt out of certain data collection practices, such as cookies</li>
                <li>Contact us to exercise your privacy rights</li>
              </ul>
            </div>

            {/* Cookies */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Cookies</h2>
              <p className="text-foreground leading-relaxed">
                Cookies are small files stored on your device to improve user experience. You can 
                choose to accept or refuse cookies. Refusing cookies may limit certain features of 
                our Service. For general information on cookies, please refer to "What Are Cookies."
              </p>
            </div>

            {/* SMS Consent */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">SMS Consent</h2>
              <p className="text-foreground leading-relaxed">
                If you provide your phone number and consent to receive SMS communications, we ensure 
                that this information will not be shared with third parties or affiliates for marketing 
                purposes under any circumstances.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Children's Privacy</h2>
              <p className="text-foreground leading-relaxed">
                Our Service does not address anyone under the age of 13. We do not knowingly collect 
                personal information from children under 13. If we discover such information, it will 
                be promptly deleted. Parents or guardians should contact us if they believe their child 
                has provided personal information.
              </p>
            </div>

            {/* Links to Other Sites */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Links to Other Sites</h2>
              <p className="text-foreground leading-relaxed">
                Our Service may contain links to external websites. We are not responsible for the 
                privacy practices or content of these third-party sites. We encourage you to review 
                their privacy policies.
              </p>
            </div>

            {/* Changes to This Privacy Policy */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Changes to This Privacy Policy</h2>
              <p className="text-foreground leading-relaxed">
                We may update our Privacy Policy periodically. Changes will be posted on this page 
                and are effective immediately upon posting. We recommend reviewing this page regularly 
                for updates.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Contact Information</h2>
              <p className="text-foreground leading-relaxed">
                For privacy-related inquiries, please contact us at:{" "}
                <a 
                  href="mailto:hello@handledly.com" 
                  className="text-primary hover:underline font-medium"
                >
                  hello@handledly.com
                </a>
              </p>
            </div>

          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;