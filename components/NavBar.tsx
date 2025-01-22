"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useScroll } from "@/hooks/use-scroll";

const NavBar = () => {
  const pathname = usePathname();
  const isDashboard = pathname?.includes("/dashboard");
  const { scrolled, visible } = useScroll();

  if (isDashboard) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          y: visible ? 0 : -100,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "border-b border-blue-400/20 bg-[#0F172A]/80 backdrop-blur-sm"
            : "bg-transparent backdrop-blur-sm border-b border-blue-400/20"
        }`}
      >
        <div className="w-full mx-auto px-4 md:px-12">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Link
                href={isDashboard ? "/dashboard" : "/"}
                className="flex items-center space-x-3"
                prefetch={false}
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-[2px]">
                  <div className="h-full w-full rounded-full bg-[#0F172A] p-1">
                    <Image
                      src="/images/technology.png"
                      alt="logo"
                      width={100}
                      height={100}
                      className="h-full w-full"
                    />
                  </div>
                </div>
                <span
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    scrolled
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-purple-400"
                      : "text-white"
                  }`}
                >
                  AgentDR
                </span>
              </Link>
            </motion.div>

            <motion.nav
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              <Button
                asChild
                variant="ghost"
                className={`transition-colors duration-300 ${
                  scrolled
                    ? "text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                <Link href="/register">Sign Up</Link>
              </Button>
            </motion.nav>
          </div>
        </div>
      </motion.header>
    </AnimatePresence>
  );
};

export default NavBar;
