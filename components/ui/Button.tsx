import Link from "next/link";
import {motion} from "framer-motion"


type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";

 
};

export default function Button({
  children,
  href,
  variant = "primary",
 
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold transition-all duration-300";

  const variants = {
    primary:
      "rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500",

    secondary:
      "rounded-xl text-gray-300  border border-gray-600 px-8 py-4 font-semibold transition hover:border-blue-500",
  };

  const className = `${baseClasses} ${variants[variant]}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{
          scale:1.7
      }}

      whileTap={{
          scale:.97
      }}
    >
     

    </motion.button>
  );
}






