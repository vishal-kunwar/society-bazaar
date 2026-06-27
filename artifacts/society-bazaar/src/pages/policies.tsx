import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

const PolicyLayout = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar
        rightContent={
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        }
      />
      <main className="container mx-auto px-4 md:px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export function TermsAndConditions() {
  return (
    <PolicyLayout title="Terms & Conditions">
        <p key={0} className="leading-relaxed mb-4">
          {"Terms & Conditions"}
        </p>
        <p key={1} className="leading-relaxed mb-4">
          {"Last Updated: June 27, 2026"}
        </p>
        <p key={2} className="leading-relaxed mb-4">
          {"Welcome to Hustly. By accessing or using our platform, you agree to these Terms & Conditions. If you do not agree, please do not use Hustly."}
        </p>
        <h2 key={3} className="text-xl font-semibold mt-8 mb-4">1. About Hustly</h2>
        <p key={4} className="leading-relaxed mb-4">
          {"Hustly is a local marketplace that connects buyers with independent home-based businesses and service providers. Hustly provides a platform for discovery and communication but is not the seller of any products or services listed on the platform."}
        </p>
        <hr key={5} className="my-8 border-border" />
        <h2 key={6} className="text-xl font-semibold mt-8 mb-4">2. Eligibility</h2>
        <p key={7} className="leading-relaxed mb-4">
          {"You must be at least 18 years old or have the permission of a parent or legal guardian to use Hustly."}
        </p>
        <hr key={8} className="my-8 border-border" />
        <h2 key={9} className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
        <p key={10} className="leading-relaxed mb-4">
          {"Sellers are required to create an account to list and manage their businesses."}
        </p>
        <p key={11} className="leading-relaxed mb-4">
          {"Buyers may browse businesses without creating an account. However, certain features such as writing reviews or saving favorites may require sign-in."}
        </p>
        <p key={12} className="leading-relaxed mb-4">
          {"You are responsible for maintaining the security of your account and login credentials."}
        </p>
        <hr key={13} className="my-8 border-border" />
        <h2 key={14} className="text-xl font-semibold mt-8 mb-4">4. Business Listings</h2>
        <p key={15} className="leading-relaxed mb-4">
          {"Sellers are responsible for ensuring that all information provided is accurate, complete, and up to date."}
        </p>
        <p key={16} className="leading-relaxed mb-4">
          {"Businesses must not list:"}
        </p>
        <ul key={17} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>Illegal products or services</li>
          <li key={1}>Fraudulent or misleading information</li>
          <li key={2}>Copyright-infringing content</li>
          <li key={3}>Offensive or harmful content</li>
        </ul>
        <p key={18} className="leading-relaxed mb-4">
          {"Hustly reserves the right to review, reject, suspend, or remove any listing at its sole discretion."}
        </p>
        <hr key={19} className="my-8 border-border" />
        <h2 key={20} className="text-xl font-semibold mt-8 mb-4">5. Reviews & Ratings</h2>
        <p key={21} className="leading-relaxed mb-4">
          {"Reviews must be honest and based on genuine customer experiences."}
        </p>
        <p key={22} className="leading-relaxed mb-4">
          {"Spam, fake reviews, abusive language, harassment, or misleading content are strictly prohibited."}
        </p>
        <p key={23} className="leading-relaxed mb-4">
          {"Hustly reserves the right to remove reviews that violate these guidelines."}
        </p>
        <hr key={24} className="my-8 border-border" />
        <h2 key={25} className="text-xl font-semibold mt-8 mb-4">6. Seller Subscription</h2>
        <p key={26} className="leading-relaxed mb-4">
          {"New sellers may receive a promotional trial offer:"}
        </p>
        <ul key={27} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>25 Free WhatsApp Leads OR 90 Days (whichever comes first)</li>
        </ul>
        <p key={28} className="leading-relaxed mb-4">
          {"After the trial period, continued access to premium seller features may require an active subscription."}
        </p>
        <p key={29} className="leading-relaxed mb-4">
          {"Current subscription pricing is displayed within the Seller Portal and may change in the future with prior notice."}
        </p>
        <hr key={30} className="my-8 border-border" />
        <h2 key={31} className="text-xl font-semibold mt-8 mb-4">7. Payments</h2>
        <p key={32} className="leading-relaxed mb-4">
          {"Subscription fees are charged according to the selected plan."}
        </p>
        <p key={33} className="leading-relaxed mb-4">
          {"Unless required by applicable law, subscription payments are non-refundable."}
        </p>
        <p key={34} className="leading-relaxed mb-4">
          {"Failure to maintain an active subscription may result in limited access to seller features."}
        </p>
        <hr key={35} className="my-8 border-border" />
        <h2 key={36} className="text-xl font-semibold mt-8 mb-4">8. Buyer & Seller Transactions</h2>
        <p key={37} className="leading-relaxed mb-4">
          {"All purchases, services, negotiations, deliveries, and payments take place directly between buyers and sellers."}
        </p>
        <p key={38} className="leading-relaxed mb-4">
          {"Hustly is not responsible for:"}
        </p>
        <ul key={39} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>Product quality</li>
          <li key={1}>Service quality</li>
          <li key={2}>Pricing disputes</li>
          <li key={3}>Deliveries</li>
          <li key={4}>Refunds</li>
          <li key={5}>Damages arising from transactions between users</li>
        </ul>
        <hr key={40} className="my-8 border-border" />
        <p key={41} className="leading-relaxed mb-4">
          {"9.Seller Subscription & Payments"}
        </p>
        <p key={42} className="leading-relaxed mb-4">
          {"New sellers are eligible for the Founding Seller Trial, which includes:"}
        </p>
        <ul key={43} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>25 Free WhatsApp Leads OR 90 Days, whichever comes first.</li>
        </ul>
        <p key={44} className="leading-relaxed mb-4">
          {"After the trial period ends, sellers may continue using premium seller features by subscribing to the Pro Plan for ₹199 per month."}
        </p>
        <p key={45} className="leading-relaxed mb-4">
          {"For the initial launch phase, subscription payments may be collected manually using UPI."}
        </p>
        <p key={46} className="leading-relaxed mb-4">
          {"Sellers may be required to:"}
        </p>
        <ul key={47} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>Complete the payment using the provided UPI QR Code.</li>
          <li key={1}>Upload the payment screenshot.</li>
          <li key={2}>Enter the UTR (Transaction Reference) Number.</li>
        </ul>
        <p key={48} className="leading-relaxed mb-4">
          {"Subscriptions become active only after successful verification by the Hustly Admin Team."}
        </p>
        <p key={49} className="leading-relaxed mb-4">
          {"Hustly reserves the right to reject payment verification if payment cannot be confirmed or if incorrect payment details are submitted."}
        </p>
        <h2 key={50} className="text-xl font-semibold mt-8 mb-4">10. Intellectual Property</h2>
        <p key={51} className="leading-relaxed mb-4">
          {"The Hustly name, logo, branding, design, and platform software are the property of Hustly."}
        </p>
        <p key={52} className="leading-relaxed mb-4">
          {"Users retain ownership of the content they upload but grant Hustly permission to display it on the platform for marketplace purposes."}
        </p>
        <hr key={53} className="my-8 border-border" />
        <h2 key={54} className="text-xl font-semibold mt-8 mb-4">11. Privacy</h2>
        <p key={55} className="leading-relaxed mb-4">
          {"Your use of Hustly is also governed by our Privacy Policy."}
        </p>
        <p key={56} className="leading-relaxed mb-4">
          {"By using Hustly, you consent to the collection and processing of your information as described in our Privacy Policy."}
        </p>
        <hr key={57} className="my-8 border-border" />
        <h2 key={58} className="text-xl font-semibold mt-8 mb-4">12. Account Suspension</h2>
        <p key={59} className="leading-relaxed mb-4">
          {"Hustly may suspend or permanently terminate accounts that:"}
        </p>
        <ul key={60} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>Violate these Terms</li>
          <li key={1}>Engage in fraud</li>
          <li key={2}>Misuse the platform</li>
          <li key={3}>Upload prohibited content</li>
          <li key={4}>Attempt to manipulate reviews or listings</li>
          <li key={5}>Harm other users or the platform</li>
        </ul>
        <hr key={61} className="my-8 border-border" />
        <h2 key={62} className="text-xl font-semibold mt-8 mb-4">13. Limitation of Liability</h2>
        <p key={63} className="leading-relaxed mb-4">
          {"Hustly acts solely as a technology platform connecting buyers and sellers."}
        </p>
        <p key={64} className="leading-relaxed mb-4">
          {"To the fullest extent permitted by law, Hustly shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of the platform or transactions between users."}
        </p>
        <hr key={65} className="my-8 border-border" />
        <h2 key={66} className="text-xl font-semibold mt-8 mb-4">14. Changes to These Terms</h2>
        <p key={67} className="leading-relaxed mb-4">
          {"Hustly may update these Terms & Conditions from time to time."}
        </p>
        <p key={68} className="leading-relaxed mb-4">
          {"Updated versions become effective immediately upon publication on the platform."}
        </p>
        <p key={69} className="leading-relaxed mb-4">
          {"Continued use of Hustly constitutes acceptance of the updated Terms."}
        </p>
        <hr key={70} className="my-8 border-border" />
        <h2 key={71} className="text-xl font-semibold mt-8 mb-4">15. Contact Us</h2>
        <p key={72} className="leading-relaxed mb-4">
          {"For questions regarding these Terms & Conditions, please contact us through the Contact page available on the Hustly platform."}
        </p>
        <hr key={73} className="my-8 border-border" />
        <p key={74} className="leading-relaxed mb-4">
          {"Thank you for using Hustly and supporting local businesses."}
        </p>
    </PolicyLayout>
  );
}

export function RefundPolicy() {
  return (
    <PolicyLayout title="Refund & Cancellation Policy">
        <p key={0} className="leading-relaxed mb-4">
          {"Refund & Cancellation Policy"}
        </p>
        <p key={1} className="leading-relaxed mb-4">
          {"Last Updated: June 27, 2026"}
        </p>
        <p key={2} className="leading-relaxed mb-4">
          {"At Hustly, we strive to provide a transparent and fair subscription experience for all sellers. Please read our Refund & Cancellation Policy carefully before purchasing a subscription."}
        </p>
        <hr key={3} className="my-8 border-border" />
        <h2 key={4} className="text-xl font-semibold mt-8 mb-4">1. Subscription Plans</h2>
        <p key={5} className="leading-relaxed mb-4">
          {"Hustly offers subscription plans for sellers to access premium features and continue receiving leads after their free trial."}
        </p>
        <p key={6} className="leading-relaxed mb-4">
          {"Current introductory offer:"}
        </p>
        <ul key={7} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>25 Free WhatsApp Leads OR 90 Days (whichever comes first)</li>
          <li key={1}>₹199/month after the trial period.</li>
        </ul>
        <hr key={8} className="my-8 border-border" />
        <h2 key={9} className="text-xl font-semibold mt-8 mb-4">2. Cancellation</h2>
        <p key={10} className="leading-relaxed mb-4">
          {"Sellers may cancel their subscription at any time."}
        </p>
        <p key={11} className="leading-relaxed mb-4">
          {"Cancellation will stop future renewals (if automatic billing is introduced in the future)."}
        </p>
        <p key={12} className="leading-relaxed mb-4">
          {"Any benefits already used during the active billing period will remain available until the subscription expires."}
        </p>
        <hr key={13} className="my-8 border-border" />
        <h2 key={14} className="text-xl font-semibold mt-8 mb-4">3. Refund Policy</h2>
        <p key={15} className="leading-relaxed mb-4">
          {"Subscription payments are generally non-refundable once a subscription has been activated."}
        </p>
        <p key={16} className="leading-relaxed mb-4">
          {"Refund requests may be considered only in exceptional situations, including:"}
        </p>
        <ul key={17} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>Duplicate payments</li>
          <li key={1}>Incorrect payment amount</li>
          <li key={2}>Technical errors that prevented subscription activation</li>
          <li key={3}>Payments made due to system malfunction</li>
        </ul>
        <p key={18} className="leading-relaxed mb-4">
          {"Refund requests are reviewed individually and approved at Hustly’s discretion."}
        </p>
        <hr key={19} className="my-8 border-border" />
        <h2 key={20} className="text-xl font-semibold mt-8 mb-4">4. Manual Payment Verification</h2>
        <p key={21} className="leading-relaxed mb-4">
          {"During the initial launch phase, subscription payments may be collected through UPI."}
        </p>
        <p key={22} className="leading-relaxed mb-4">
          {"To activate a subscription, sellers may be required to:"}
        </p>
        <ul key={23} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>Complete the payment using the provided UPI QR Code</li>
          <li key={1}>Upload a payment screenshot</li>
          <li key={2}>Enter the correct UTR (Transaction Reference) Number</li>
        </ul>
        <p key={24} className="leading-relaxed mb-4">
          {"Subscriptions become active only after successful payment verification by the Hustly Admin Team."}
        </p>
        <hr key={25} className="my-8 border-border" />
        <h2 key={26} className="text-xl font-semibold mt-8 mb-4">5. Invalid or Unverified Payments</h2>
        <p key={27} className="leading-relaxed mb-4">
          {"Hustly reserves the right to reject payment verification if:"}
        </p>
        <ul key={28} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>The payment cannot be verified.</li>
          <li key={1}>An incorrect UTR number is submitted.</li>
          <li key={2}>The uploaded payment screenshot is invalid or altered.</li>
          <li key={3}>The payment amount does not match the required subscription fee.</li>
        </ul>
        <p key={29} className="leading-relaxed mb-4">
          {"If verification fails, the subscription will not be activated."}
        </p>
        <hr key={30} className="my-8 border-border" />
        <h2 key={31} className="text-xl font-semibold mt-8 mb-4">6. Trial Period</h2>
        <p key={32} className="leading-relaxed mb-4">
          {"The free trial is available only as described in the current promotional offer."}
        </p>
        <p key={33} className="leading-relaxed mb-4">
          {"Once the free trial ends (25 WhatsApp Leads or 90 Days, whichever comes first), continued access to premium seller features requires an active subscription."}
        </p>
        <p key={34} className="leading-relaxed mb-4">
          {"The free trial itself is non-transferable and cannot be redeemed for cash."}
        </p>
        <hr key={35} className="my-8 border-border" />
        <h2 key={36} className="text-xl font-semibold mt-8 mb-4">7. Subscription Changes</h2>
        <p key={37} className="leading-relaxed mb-4">
          {"Hustly may modify subscription pricing, features, or promotional offers in the future."}
        </p>
        <p key={38} className="leading-relaxed mb-4">
          {"Any changes will apply prospectively and will not affect an already active subscription until its current billing period ends."}
        </p>
        <hr key={39} className="my-8 border-border" />
        <h2 key={40} className="text-xl font-semibold mt-8 mb-4">8. Fraudulent Activity</h2>
        <p key={41} className="leading-relaxed mb-4">
          {"Hustly reserves the right to suspend or permanently terminate accounts involved in:"}
        </p>
        <ul key={42} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>Payment fraud</li>
          <li key={1}>Fake payment confirmations</li>
          <li key={2}>Forged screenshots</li>
          <li key={3}>Invalid UTR submissions</li>
          <li key={4}>Chargeback abuse</li>
          <li key={5}>Any attempt to misuse the subscription system</li>
        </ul>
        <p key={43} className="leading-relaxed mb-4">
          {"No refunds will be issued in such cases."}
        </p>
        <hr key={44} className="my-8 border-border" />
        <h2 key={45} className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
        <p key={46} className="leading-relaxed mb-4">
          {"For subscription, refund, or payment-related questions, please contact our support team through the Contact Us page available on the Hustly platform."}
        </p>
        <p key={47} className="leading-relaxed mb-4">
          {"We aim to respond to all payment-related queries within 24–48 business hours."}
        </p>
        <hr key={48} className="my-8 border-border" />
        <p key={49} className="leading-relaxed mb-4">
          {"Thank you for supporting local businesses through Hustly."}
        </p>
    </PolicyLayout>
  );
}

export function ContactPolicy() {
  return (
    <PolicyLayout title="Contact Us">
        <p key={0} className="leading-relaxed mb-4">
          {"Contact Us"}
        </p>
        <p key={1} className="leading-relaxed mb-4">
          {"We’re always happy to hear from you."}
        </p>
        <p key={2} className="leading-relaxed mb-4">
          {"Whether you have a question, feedback, business inquiry, or need support, feel free to reach out."}
        </p>
        <p key={3} className="leading-relaxed mb-4">
          {"Customer Support"}
        </p>
        <p key={4} className="leading-relaxed mb-4">
          {"For any questions regarding:"}
        </p>
        <ul key={5} className="list-disc pl-6 space-y-1 mb-4">
          <li key={0}>Business Listings</li>
          <li key={1}>Seller Accounts</li>
          <li key={2}>Subscription Plans</li>
          <li key={3}>Payments</li>
          <li key={4}>Technical Support</li>
          <li key={5}>Feedback</li>
        </ul>
        <p key={6} className="leading-relaxed mb-4">
          {"Please contact us through:"}
        </p>
        <p key={7} className="leading-relaxed mb-4">
          {"Email: support.hustly@gmail.com (Replace with your official email when available.)"}
        </p>
        <p key={8} className="leading-relaxed mb-4">
          {"Response Time"}
        </p>
        <p key={9} className="leading-relaxed mb-4">
          {"We aim to respond to all support requests within 24–48 business hours."}
        </p>
        <p key={10} className="leading-relaxed mb-4">
          {"Thank you for being a part of the Hustly community and supporting local businesses."}
        </p>
    </PolicyLayout>
  );
}

export function AboutPolicy() {
  return (
    <PolicyLayout title="About Hustly">
        <p key={0} className="leading-relaxed mb-4">
          {"Welcome to Hustly, a local marketplace that connects buyers with independent home-based businesses and service providers."}
        </p>
        <p key={1} className="leading-relaxed mb-4">
          {"Our mission is to empower local entrepreneurs and provide communities with a trusted platform to discover amazing local services and products."}
        </p>
        <p key={2} className="leading-relaxed mb-4">
          {"Thank you for supporting local businesses!"}
        </p>
    </PolicyLayout>
  );
}
