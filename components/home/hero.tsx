import Image from "next/image";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import FadeIn from "../ui/FadeIn";
import {motion} from "framer-motion" ;


export default function Hero(){
    return(
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <FadeIn>
        {/* Left Side */}
        <div>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            Professional Algorithmic Trading Solutions
          </p>

          

          <h1 className="text-gray-200 text-5xl font-bold leading-tight lg:text-7xl">
            Elite Algorithms.
            <br />
            <span className="text-blue-500">
              Exceptional Results.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg text-gray-400">
            Powerful Expert Advisors, Indicators and Trading
            Tools built to give traders a professional edge
            in any market.
          </p>
            <div className="mt-10 flex flex-wrap gap-4">

            <Button href="/products">

                Explore Products

            </Button>

            <Button
                variant="secondary"
                href="/build-project"
                >

                Build Your Project

            </Button>

            </div>
          
            <div className="mt-10 flex  gap-8 text-sm text-gray-400">

                <span>✔ Premium Quality</span>

                <span>✔ Secure & Reliable</span>

                <span>✔ Lifetime Support</span>

                <span>✔ Optimized Performance</span>

            </div>
                    
           
        </div>
      </FadeIn> 
        {/* Right Side */}

        <FadeIn delay={0.3}>
          <div className="flex justify-center">
           
              <Image
                src="/images/hero-robot.png"
                alt="AI Trading Robot"
                width={900}
                height={900}
                className="w-full max-w-xl"
              />
           
          </div>
        </FadeIn>
        
         


      </div>

      
    </section>
    );
}