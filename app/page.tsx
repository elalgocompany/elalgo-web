import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";


export default function Home(){
  return (
    <main>
      <Navbar/>
      <Hero/>
      <FeaturedProducts/>
    </main>

  );


}