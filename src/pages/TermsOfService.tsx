import { Header } from "@/components/layout/Header";
import { Footer, Container, Section } from "@/components/layout";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-background">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Terms and Conditions
            </h1>
            <p className="text-muted-foreground">
              Last Updated: January 2026
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
              <h2 className="text-2xl font-bold text-primary mb-4">Introduction</h2>
              <p className="text-foreground leading-relaxed">
                Welcome to{" "}
                <a href="https://handledly.com" className="text-primary hover:underline">
                  https://handledly.com
                </a>{" "}
                ("Website"). These Terms and Conditions ("Terms") govern your use of our Website 
                and the services provided by Handledly Moving Services Inc. ("Company," "we," "our," or "us"). By 
                accessing or using our Website, you agree to these Terms. If you do not agree, 
                you must discontinue use of the Website immediately.
              </p>
            </div>

            {/* Services */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Services</h2>
              <p className="text-foreground leading-relaxed">
                Our Website provides information about moving services offered by Handledly Moving Services. 
                Specific terms regarding individual services may be detailed in a separate 
                agreement between you and the Company.
              </p>
            </div>

            {/* Eligibility */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Eligibility</h2>
              <p className="text-foreground leading-relaxed">
                By using this Website, you affirm that you are at least 18 years old or have the 
                consent of a legal guardian to use our services. You also agree to provide accurate 
                and complete information when requested.
              </p>
            </div>

            {/* Prohibited Activities */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Prohibited Activities</h2>
              <p className="text-foreground mb-4">You agree not to engage in the following activities:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Violating any applicable laws or regulations.</li>
                <li>Interfering with the operation of the Website or other users' enjoyment of it.</li>
                <li>Attempting unauthorized access to our systems or accounts.</li>
                <li>Uploading or distributing harmful software, including viruses.</li>
                <li>Using the Website to spam, defame, or harass others.</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Intellectual Property</h2>
              <p className="text-foreground leading-relaxed">
                All content on this Website, including text, graphics, logos, images, and software, 
                is the property of Handledly Moving Services Inc. or its licensors and is protected by copyright and 
                trademark laws. You may not reproduce, distribute, or modify any content without 
                our prior written consent.
              </p>
            </div>

            {/* Disclaimers and Limitations of Liability */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Disclaimers and Limitations of Liability</h2>
              <ul className="list-disc pl-6 space-y-4 text-foreground">
                <li>
                  <strong>Service Availability:</strong> We make every effort to ensure the availability 
                  and accuracy of our Website and services. However, we do not guarantee uninterrupted 
                  access or the absence of errors.
                </li>
                <li>
                  <strong>Liability:</strong> To the fullest extent permitted by law, we disclaim any 
                  liability for damages arising out of your use of the Website, including direct, 
                  indirect, incidental, or consequential damages.
                </li>
              </ul>
            </div>

            {/* User Accounts */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">User Accounts</h2>
              <p className="text-foreground leading-relaxed">
                If you create an account on our Website, you are responsible for maintaining its 
                confidentiality and security. You agree to notify us immediately of any unauthorized 
                access or use.
              </p>
            </div>

            {/* Third-Party Links */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Third-Party Links</h2>
              <p className="text-foreground leading-relaxed">
                Our Website may contain links to third-party websites or services that are not owned 
                or controlled by us. We are not responsible for the content, privacy practices, or 
                operations of these third-party sites.
              </p>
            </div>

            {/* Messaging and Communications */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Messaging and Communications</h2>
              
              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Messaging Frequency</h3>
              <p className="text-foreground leading-relaxed mb-4">
                By opting in, you consent to receive recurring messages from us. The frequency of 
                these messages may vary depending on the service you're subscribed to (e.g., weekly, 
                monthly, or as events or promotions arise).
              </p>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Potential Fees</h3>
              <p className="text-foreground leading-relaxed mb-4">
                Standard messaging and data rates may apply depending on your mobile carrier and plan. 
                You are responsible for any charges incurred from receiving messages.
              </p>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Opt-In Method</h3>
              <p className="text-foreground leading-relaxed mb-4">
                To opt-in to our messaging service, you must provide explicit consent by checking the 
                box below the contact form through our website at{" "}
                <a href="https://handledly.com/contact" className="text-primary hover:underline">
                  https://handledly.com/contact
                </a>.
              </p>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Opt-Out Method</h3>
              <p className="text-foreground leading-relaxed">
                You can opt out of receiving further messages at any time by replying with STOP to 
                opt out. After opting out, you will no longer receive further messages unless you 
                opt back in.
              </p>
            </div>

            {/* SMS Terms and Conditions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">SMS Terms and Conditions</h2>
              
              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">SMS Consent Communication</h3>
              <p className="text-foreground leading-relaxed mb-4">
                The information obtained as part of the SMS consent process will not be shared with 
                third parties for marketing purposes.
              </p>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Types of SMS Communications</h3>
              <p className="text-foreground leading-relaxed mb-4">
                If you have consented to receive text messages from Handledly Moving Services, you may 
                receive messages related to the following:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
                <li>Details of your order</li>
              </ul>
              <p className="text-foreground mb-2">Example:</p>
              <blockquote className="bg-muted border-l-4 border-primary p-4 rounded-r-lg my-4">
                <p className="text-foreground italic">
                  "Perfect, [Name]. Your moving is added to our company's schedule for [Date and Time]. 
                  Our quote is as we agreed [Price]. It includes: 2 Movers team, Truck, and all the 
                  needed supplies for the move.
                  <br /><br />
                  No Truck fee and no travel fee, all the taxes are included in the quote.
                  <br /><br />
                  If you need help assembling or disassembling your furniture, it's also included.
                  <br /><br />
                  Min 2 hours
                  <br /><br />
                  Our priority is to ensure your move is smooth and hassle-free. See you soon and have 
                  an amazing day!
                  <br /><br />
                  Handledly Moving Services team
                  <br /><br />
                  Reply STOP to opt out of SMS messaging at any time."
                </p>
              </blockquote>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Message Frequency</h3>
              <p className="text-foreground leading-relaxed mb-4">
                Message frequency may vary depending on the type of communication. For example, you 
                may receive up to 5 SMS messages per week related to your questions.
              </p>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Potential Fees for SMS Messaging</h3>
              <p className="text-foreground leading-relaxed mb-4">
                Please note that standard message and data rates may apply, depending on your carrier's 
                pricing plan. These fees may vary if the message is sent domestically or internationally.
              </p>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Opt-In Method</h3>
              <p className="text-foreground mb-4">
                You may opt-in to receive SMS messages from Handledly Moving Services in the following ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
                <li>Verbally, during a conversation</li>
                <li>By submitting an online form</li>
              </ul>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Opt-Out Method</h3>
              <p className="text-foreground leading-relaxed mb-4">
                You can opt-out of receiving SMS messages at any time. To do so, simply reply "STOP" 
                to any SMS message you receive. Alternatively, you can contact us directly to request 
                removal from our messaging list.
              </p>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Additional Options</h3>
              <p className="text-foreground leading-relaxed mb-4">
                If you do not wish to receive SMS messages, you can choose not to check the SMS 
                consent box on our forms.
              </p>

              <h3 className="text-xl font-semibold text-primary mt-6 mb-3">Standard Messaging Disclosures</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Message and data rates may apply.</li>
                <li>You can opt out at any time by texting "STOP."</li>
                <li>
                  For assistance, text "HELP" or visit our{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link> pages.
                </li>
                <li>Message frequency may vary.</li>
              </ul>
            </div>

            {/* Changes to Terms */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Changes to Terms</h2>
              <p className="text-foreground leading-relaxed">
                We reserve the right to update or modify these Terms at any time. Changes will be 
                posted on this page with the "Last Updated" date. Continued use of the Website after 
                modifications constitutes your acceptance of the new Terms.
              </p>
            </div>

            {/* Termination */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Termination</h2>
              <p className="text-foreground leading-relaxed">
                We reserve the right to terminate or suspend access to our Website and services 
                without prior notice if we believe you have violated these Terms.
              </p>
            </div>

            {/* Governing Law */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Governing Law</h2>
              <p className="text-foreground leading-relaxed">
                These Terms are governed by the laws of the United States and the state where our 
                business is located, without regard to conflict of law principles.
              </p>
            </div>

            {/* Contact Us */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
              <p className="text-foreground leading-relaxed">
                If you have any questions or concerns about these Terms, please contact us at:{" "}
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

export default TermsOfService;