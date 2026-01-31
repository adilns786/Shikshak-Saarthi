"use client";

import { create } from "zustand";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "./button";

// Tour steps definition
export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

interface TourState {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (steps: TourStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
  setStep: (step: number) => void;
}

// Global tour state
export const useTourStore = create<TourState>((set) => ({
  isActive: false,
  currentStep: 0,
  steps: [],
  startTour: (steps) => set({ isActive: true, steps, currentStep: 0 }),
  nextStep: () => set((state) => ({ 
    currentStep: Math.min(state.currentStep + 1, state.steps.length - 1) 
  })),
  prevStep: () => set((state) => ({ 
    currentStep: Math.max(state.currentStep - 1, 0) 
  })),
  endTour: () => set({ isActive: false, currentStep: 0 }),
  setStep: (step) => set({ currentStep: step }),
}));

export function InteractiveTour() {
  const { isActive, currentStep, steps, nextStep, prevStep, endTour } = useTourStore();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (!isActive || !currentStepData) {
      setTargetElement(null);
      return;
    }

    // Find target element
    const element = document.querySelector(currentStepData.target) as HTMLElement;
    if (!element) {
      console.warn(`Tour target not found: ${currentStepData.target}`);
      return;
    }

    setTargetElement(element);

    // Scroll element into view
    element.scrollIntoView({ behavior: "smooth", block: "center" });

    // Calculate position for tooltip
    const rect = element.getBoundingClientRect();
    const placement = currentStepData.placement || "bottom";

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = rect.top - 20;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - 20;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + 20;
        break;
    }

    setPosition({ top, left });

    // Execute step action if any
    if (currentStepData.action) {
      currentStepData.action();
    }

    // Add highlight class
    element.classList.add("tour-highlight");

    return () => {
      element.classList.remove("tour-highlight");
    };
  }, [isActive, currentStep, currentStepData]);

  if (!isActive || !currentStepData) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[9998]"
        onClick={endTour}
      />

      {/* Highlight Spotlight */}
      {targetElement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
            boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)",
            borderRadius: "8px",
            transition: "all 0.3s ease",
          }}
        />
      )}

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[10000] max-w-sm"
        style={{
          top: Math.min(Math.max(position.top, 100), window.innerHeight - 400),
          left: Math.min(Math.max(position.left, 20), window.innerWidth - 420),
          transform: "translate(-50%, 0)",
        }}
      >
        <div className="bg-gradient-to-br from-slate-900 to-purple-900 text-white rounded-xl shadow-2xl border border-blue-500/50 p-6 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
            </div>
            <button
              onClick={endTour}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-300 text-sm mb-4">{currentStepData.content}</p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="flex-1 border-white/20 hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            {isLastStep ? (
              <Button
                size="sm"
                onClick={endTour}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Finish
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={nextStep}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Global CSS for highlight */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 9999 !important;
          pointer-events: auto !important;
        }
      `}</style>
    </>
  );
}

// Help Button Component
export function HelpButton({ steps }: { steps: TourStep[] }) {
  const startTour = useTourStore((state) => state.startTour);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => startTour(steps)}
      className="fixed bottom-24 right-6 z-[9997] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl flex items-center gap-2 group"
    >
      <Sparkles className="h-6 w-6" />
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        whileHover={{ width: "auto", opacity: 1 }}
        className="overflow-hidden whitespace-nowrap font-semibold"
      >
        Need Help?
      </motion.span>
    </motion.button>
  );
}
