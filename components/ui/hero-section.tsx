"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedText } from "@/components/ui/animated-text";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, TrendingUp } from "lucide-react";

const heroTexts = [
  "Automated Faculty Appraisal & Development System",
  "Streamlining Self-Appraisal Processes",
  "Ensuring Transparency and Efficiency",
  "Empowering VESIT Faculty Excellence",
];

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Evaluation",
    description:
      "Multi-dimensional assessment covering teaching, research, and service",
  },
  {
    icon: Users,
    title: "Collaborative Platform",
    description: "Seamless interaction between faculty and administrators",
  },
  {
    icon: TrendingUp,
    title: "Data-Driven Insights",
    description: "Analytics and reporting for informed decision making",
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/academic-pattern.jpg')] bg-repeat opacity-10"></div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-accent/10 rounded-full blur-xl"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
        animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-center text-primary leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <img
                src="https://vesit.ves.ac.in/navbar2024nobackground.png"
                alt="VESIT Logo"
                className="h-24 w-auto mx-auto mb-4 object-contain"
              />
              <span className="block">VESIT</span>
              <span className="text-accent">Faculty Portal</span>
            </motion.h1>

            <motion.div
              className="text-xl md:text-2xl text-muted-foreground mb-6 h-16 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <AnimatedText texts={heroTexts} className="animate-text-morph" />
            </motion.div>

            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              The Automated Faculty Appraisal & Development System is a
              web-based platform designed to streamline faculty self-appraisal
              processes. Faculty can log activities like research, seminars,
              projects, and lectures securely, while administrators gain
              real-time insights to support transparent decision-making.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Button asChild size="lg" className="group">
                <Link href="/auth/login">
                  Login
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">Learn More</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            id="features"
            className="grid md:grid-cols-3 gap-8 mt-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border/50 hover:border-accent/50 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <feature.icon className="h-12 w-12 text-accent mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
