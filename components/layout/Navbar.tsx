
import Link from "next/link";
import {Search , ShoppingCart} from "lucide-react" ; 
import {navigation} from "@/data/navigation" ; 
import Image from "next/image";


export default function Navbar(){

    return(
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link href="/" className=" flex items-center text-3xl font-bold text-white">
            <Image
                src="/images/Logo.png"
                alt="ElAlgo Logo"
                width={80}
                height={50}
            />
            ElAlgo
        </Link>
           
            
        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="text-sm text-gray-300 transition hover:text-white"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          <Search
            size={20}
            className="cursor-pointer text-gray-300 hover:text-white"
          />

          <ShoppingCart
            size={20}
            className="cursor-pointer text-gray-300 hover:text-white"
          />

          <Link
            href="/auth/login"
            className="rounded-xl border border-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
        
    );

}