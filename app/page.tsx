'use client' ;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, VideoIcon, Check } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-blue-500 to-purple-600">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 text-white">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
                    Revolutionize Your Demo Creation
                  </h1>
                  <p className="max-w-[600px] text-lg md:text-xl">
                    Effortlessly create screen recordings with voiceovers and animations. Experience the next level of demo creation with V1 and V2 features.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-white text-blue-600 hover:bg-gray-200">Get Started</Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">Learn More</Button>
                </div>
              </div>
              <AspectRatio ratio={16 / 9}>
                <img
                  src="https://placehold.co/600x400.png"
                  alt="Hero"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              </AspectRatio>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-blue-600">Features</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover the powerful features that make our demo creation tool the best choice for you.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="flex flex-col items-center justify-center space-y-4">
                <VideoIcon className="h-12 w-12 text-blue-600" />
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Screen Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Capture high-quality screen recordings effortlessly.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center justify-center space-y-4">
                <Avatar>
                  <AvatarImage src="https://placehold.co/600x400.png" />
                  <AvatarFallback>VO</AvatarFallback>
                </Avatar>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Voiceover</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Add professional voiceovers to your demos easily.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center justify-center space-y-4">
                <ArrowRight className="h-12 w-12 text-blue-600" />
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Animations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Enhance your videos with stunning animations.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-purple-600 to-blue-500">
          <div className="container px-4 md:px-6 text-white">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Pricing</h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that best fits your needs.
                </p>
              </div>
              <div className="grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                <Card className="flex flex-col items-start space-y-4 p-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Basic</h3>
                    <p className="text-4xl font-bold">
                      $9<span className="text-2xl font-medium text-white/80">/mo</span>
                    </p>
                  </div>
                  <ul className="grid gap-2">
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Screen Recording
                    </li>
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Basic Editing
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </Card>
                <Card className="flex flex-col items-start space-y-4 p-6 bg-white text-blue-600">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Pro</h3>
                    <p className="text-4xl font-bold">
                      $19<span className="text-2xl font-medium text-blue-600/80">/mo</span>
                    </p>
                  </div>
                  <ul className="grid gap-2">
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Voiceover
                    </li>
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Advanced Editing
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-500">
                    Get Started
                  </Button>
                </Card>
                <Card className="flex flex-col items-start space-y-4 p-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Enterprise</h3>
                    <p className="text-4xl font-bold">
                      $49<span className="text-2xl font-medium text-white/80">/mo</span>
                    </p>
                  </div>
                  <ul className="grid gap-2">
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Custom Integrations
                    </li>
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Priority Support
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-white p-6 md:py-12 w-full">
        <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
          <div className="grid gap-1">
            <h3 className="font-semibold text-blue-600">Product</h3>
            <a href="#" className="text-gray-600">Features</a>
            <a href="#" className="text-gray-600">Integrations</a>
            <a href="#" className="text-gray-600">Pricing</a>
            <a href="#" className="text-gray-600">Security</a>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold text-blue-600">Company</h3>
            <a href="#" className="text-gray-600">About Us</a>
            <a href="#" className="text-gray-600">Careers</a>
            <a href="#" className="text-gray-600">Blog</a>
            <a href="#" className="text-gray-600">Contact</a>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold text-blue-600">Resources</h3>
            <a href="#" className="text-gray-600">Documentation</a>
            <a href="#" className="text-gray-600">Help Center</a>
            <a href="#" className="text-gray-600">Community</a>
            <a href="#" className="text-gray-600">Templates</a>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold text-blue-600">Legal</h3>
            <a href="#" className="text-gray-600">Privacy Policy</a>
            <a href="#" className="text-gray-600">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;