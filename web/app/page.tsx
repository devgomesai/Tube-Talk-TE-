import Navbar from "@/components/Landing/Navbar";
import Hero from "@/components/Landing/Hero";
import ExplanationVideo from "@/components/Landing/ExplanationVideo";

export default async function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Fixed Header */}
      <Navbar />

      {/* Hero Section */}
      <Hero />
      {/* Video Section */}
      <ExplanationVideo />
    </div>
  );
}
