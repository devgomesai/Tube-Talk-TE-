import Navbar from "@/components/Landing/Navbar";
import Hero from "@/components/Landing/Hero";
import ExplanationVideo from "@/components/Landing/ExplanationVideo";
import Features from "@/components/Landing/Features";
import Testimonials from "@/components/Landing/Testimonials";
import Footer from "@/components/Landing/Footer";
import ContactUs from "@/components/Landing/ContactUs";

export default async function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Fixed Header */}
      <Navbar />

      {/* Hero Section */}
      <Hero />
      {/* Video Section */}
      <ExplanationVideo />

      {/* Features Section */}
      <Features />
      {/* Testimonials Section */}
      <Testimonials />


      {/* Contact Us Section */}
      <ContactUs />
      {/* Footer Section */}
      <Footer />


    </div>
  );
}
