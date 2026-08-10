import { DemoRequestProvider } from "@/components/DemoRequest";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Problem from "@/components/Problem";
import Product from "@/components/Product";
import Platform from "@/components/Platform";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <DemoRequestProvider>
      <main>
      <Navbar />
      <Hero />
      <TrustBar />
      <Problem />
      <Product />
      <Platform />
      <Pricing />
      <Faq />
      <FinalCta />
        <Footer />
      </main>
    </DemoRequestProvider>
  );
}
