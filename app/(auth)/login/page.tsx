"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderCircleIcon, Mail, Lock } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res?.ok) {
        router.push(`/dashboard`);
      } else {
        toast.error(res?.error ?? "An error occurred");
      }
    } catch (error: any) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-20" />
        <div className="relative bg-[#1E293B]/40 backdrop-blur-xl rounded-2xl border border-blue-400/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-purple-400"
            >
              Welcome back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-gray-400"
            >
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                prefetch={false}
              >
                Sign up
              </Link>
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
            onSubmit={loginUser}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-[#1E293B]/50 border-blue-400/20 text-white placeholder:text-gray-500 focus:ring-blue-400/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-[#1E293B]/50 border-blue-400/20 text-white placeholder:text-gray-500 focus:ring-blue-400/30"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              {loading ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
