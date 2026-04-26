import { Suspense } from "react";
import { HeroSection } from "@/components/ui/hero-section";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <HeroSection />
      </Suspense>
    </main>
  );
}
