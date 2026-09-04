import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Footer from "@/components/layout/Footer";
import AdvisorPerformanceCard from "@/components/advisor/AdvisorPerformanceCard";
export default function Home(){
  return (
    <main>
      <Navbar/>
      <Hero
  eyebrow="Professional Algorithmic Trading Solutions"
  title="Elite Algorithms."
  highlightedTitle="Exceptional Results."
  description="
    Powerful Expert Advisors, Indicators and Trading
    Tools built to give traders a professional edge
    in any market.
  "
  image="/images/hero-robot.png"
  imageAlt="AI Trading Robot"
  accent="blue"
  buttons={[
    {
      label: "Explore Products",
      href: "/products",
    },
    {
      label: "Build Your Project",
      href: "/build-project",
      variant: "secondary",
    },
  ]}
  points={[
    {
      text: "Premium Quality",
    },
    {
      text: "Secure & Reliable",
    },
    {
      text: "Lifetime Support",
    },
    {
      text: "Optimized Performance",
    },
  ]}
/>
      <AdvisorPerformanceCard/> 
      <FeaturedProducts/>

      <Footer/> 
    </main>

  );


}