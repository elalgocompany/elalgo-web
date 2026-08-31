import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/hero";
import ProductExplorer from "@/components/product/ProductExplorer";
import Footer from "@/components/layout/Footer";

import { getProducts } from "@/lib/products";
import TopNotchShowcase from "@/components/product/TopNotchShowcase";
export default async function ProductsPage() {
  const products =
  await getProducts();

  const topNotchProducts =
    products.filter(
      (product) =>
        product.top_notch
    );
  const featuredProducts = products.filter(
    (product) => product.featured
  );

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <Navbar />

      {/* HERO */}

      <Hero
        eyebrow="ElAlgo Trading Products"
        title="Professional Tools."
        highlightedTitle="Built For Traders."
        description="
          Discover Expert Advisors, indicators and trading
          assistants built for MetaTrader 4 and MetaTrader 5.
          Choose from free tools, premium products and
          professional trading solutions.
        "
        image="/images/products-hero.png"
        imageAlt="Professional algorithmic trading products"
        accent="green"
        imagePosition="left"

        visual={
          <TopNotchShowcase
            products={topNotchProducts}
          />
        }

        points={[
          { text: "Tested Products" },
          { text: "Secure Licensing" },
          { text: "MT4 & MT5" },
          { text: "Customer Support" },
        ]}
      />

      {/* ALL PRODUCTS */}

      <ProductExplorer products={products} />
        <Footer/>
    </main>
  );
}