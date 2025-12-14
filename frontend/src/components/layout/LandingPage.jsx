import { Box } from "@mui/material";
import NavBar from "./NavBar";
import Hero from "../landingPageComponents/Hero";
import PlatformOverview from "../landingPageComponents/PlatformOverview";
import DiseaseShowcase from "../landingPageComponents/DiseaseShowcase";
import AiMedicalAssistant from "../landingPageComponents/AiMedicalAssistant";
import Footer from "../landingPageComponents/Footer";
import BlogSection from "../landingPageComponents/BlogSection";

export default function LandingPage() {
  return (
    <Box>
      <NavBar />
      <Hero />
      <PlatformOverview id="platform-overview" />
      <DiseaseShowcase id="disease-showcase" />
      <AiMedicalAssistant id="ai-medical-assistant" />
      <BlogSection id="blog-section" />
      <Footer />
    </Box>
  );
}
