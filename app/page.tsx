"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoIcon, Sparkles, Mic, Code2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { motion } from "framer-motion";
import Image from "next/image";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0F172A]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <main className="flex-1 relative">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="grid gap-12 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_600px] items-center"
            >
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center rounded-lg bg-blue-600/10 px-4 py-2 text-sm font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI-Powered Demo Creation
                  </motion.div>
                  <motion.h1
                    className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-purple-400 !leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Create Stunning Demo Videos with AI
                  </motion.h1>
                  <motion.p
                    className="max-w-[600px] text-lg md:text-xl text-gray-400 !leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Transform your ideas into professional demos using
                    AI-powered screen recordings, natural voiceovers, and
                    captivating animations. No technical expertise needed.
                  </motion.p>
                </div>
                <motion.div
                  className="flex flex-col gap-4 min-[400px]:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-base"
                  >
                    Start Creating Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-400/20 text-blue-400 hover:bg-blue-400/80 text-base"
                  >
                    Watch Demo
                  </Button>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-20 -z-10" />
                <AspectRatio
                  ratio={16 / 9}
                  className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl overflow-hidden border border-white/10"
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source
                      src="https://cdn.dribbble.com/users/1314493/screenshots/17380268/media/c1cf61db92daa8f539e0d6585d50a39c.mp4"
                      type="video/mp4"
                    />
                  </video>
                </AspectRatio>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-24 md:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20" />
          <div className="container px-4 md:px-6 relative">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Powerful AI Features
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to create professional-grade demo videos
                  powered by artificial intelligence
                </p>
              </div>
            </motion.div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-3">
              {[
                {
                  icon: <VideoIcon className="h-10 w-10" />,
                  title: "Auto Demo Recording",
                  description:
                    "Automatically record demos of any live product with simple prompts",
                },
                {
                  icon: <Mic className="h-10 w-10" />,
                  title: "Google Drive Integration",
                  description:
                    "Seamlessly integrate with Google Drive for easy access to your recordings",
                },
                {
                  icon: <Code2 className="h-10 w-10" />,
                  title: "Professional Voiceover",
                  description:
                    "Generate high-quality voiceovers for your demos with professional clarity",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                  <Card className="relative overflow-hidden bg-gradient-to-b from-blue-900/40 to-purple-900/40 border-blue-400/20 backdrop-blur-sm group-hover:border-blue-400/40 transition-all duration-500 min-h-[300px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
                    <CardHeader className="pb-4">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-[2px] mb-6">
                        <div className="h-full w-full text-center mx-auto rounded-full bg-[#0F172A] flex items-center justify-center">
                          {feature.icon}
                        </div>
                      </div>
                      <CardTitle className="text-[20px] font-bold text-gradient-to-r from-blue-400 to-purple-400">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-800 text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-400/20 bg-[#0F172A]/80 backdrop-blur-sm">
        <div className="container px-4 py-16 md:py-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-12 text-sm">
            {["Product", "Company", "Resources", "Legal"].map(
              (section, index) => (
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-blue-400 text-base">
                    {section}
                  </h3>
                  <div className="grid gap-3">
                    {["Features", "About", "Help", "Privacy"].map((item, i) => (
                      <a
                        key={i}
                        href="#"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
