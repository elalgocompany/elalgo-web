import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import Container from "../ui/Container";
import FilterChip from "../ui/FilterChip";
import SectionTitle from "../ui/SectionTitle";
import FadeIn from "../ui/FadeIn";

export default async function FeaturedProducts() {
  const products = await getProducts() ; 
  return (
    <section className="py-32">

      <Container>

        <SectionTitle
          badge="OUR PRODUCTS"
          title="Featured Products"
          subtitle="Discover our premium Expert Advisors, Indicators and Trading Tools."
        />

        <div className="mb-12 flex flex-wrap justify-center gap-4">

          <FilterChip
            label="All"
            active
          />

          <FilterChip label="Expert Advisors" />

          <FilterChip label="Indicators" />

          <FilterChip label="Assistants" />

          <FilterChip label="Premium" />

          <FilterChip label="Free" />

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {products.map((product, index) => (

            <FadeIn
                key={product.id}
                delay={index*0.1}
            >

            <ProductCard
                key={product.id}
                product={product}
            />

            </FadeIn>

))}

        </div>

      </Container>

    </section>
  );
}