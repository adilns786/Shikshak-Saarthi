"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface PreloaderProps {
  isLoading?: boolean;
  onComplete?: () => void;
  message?: string;
  showProgress?: boolean;
}

export function Preloader({ 
  isLoading = true, 
  onComplete,
  message = "Loading...",
  showProgress = true 
}: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(isLoading);

  useEffect(() => {
    if (isLoading && showProgress) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isLoading, showProgress]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShow(true);
    }
  }, [isLoading, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#2b2d42] via-[#1a1a2e] to-[#2b2d42]"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/5"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* 3D Rotating Logo Container */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Outer Glow Ring */}
            <motion.div
              className="absolute inset-0 -m-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full border-2 border-transparent border-t-[#ef233c] border-r-[#ef233c]/50 blur-sm" />
            </motion.div>

            {/* Inner Glow Ring */}
            <motion.div
              className="absolute inset-0 -m-4"
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full border-2 border-transparent border-b-[#8d99ae] border-l-[#8d99ae]/50 blur-sm" />
            </motion.div>

            {/* 3D Logo Container */}
            <motion.div
              className="relative"
              style={{ perspective: "1000px" }}
              animate={{
                rotateY: [0, 10, 0, -10, 0],
                rotateX: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Logo Shadow */}
              <motion.div
                className="absolute inset-0 blur-xl bg-[#ef233c]/30 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* VESIT Logo */}
              <motion.img
                src="https://vesit.ves.ac.in/navbar2024nobackground.png"
                alt="VESIT Logo"
                className="h-28 w-auto relative z-10 drop-shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>

            {/* Pulsing Ring Effect */}
            <motion.div
              className="absolute inset-0 -m-12"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.5, 0.8],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              <div className="w-full h-full rounded-full border border-[#ef233c]/30" />
            </motion.div>

            {/* App Title */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-white mb-2">
                <span className="text-[#ef233c]">Shikshak</span> Sarthi
              </h1>
              <p className="text-sm text-[#8d99ae]">Faculty Appraisal System</p>
            </motion.div>

            {/* Loading Dots Animation */}
            <motion.div
              className="flex gap-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-[#ef233c]"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>

            {/* Progress Bar */}
            {showProgress && (
              <motion.div
                className="mt-6 w-48"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#ef233c] to-[#d90429] rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-[#8d99ae] text-center mt-2">
                  {message}
                </p>
              </motion.div>
            )}
          </div>

          {/* Bottom Wave Animation */}
          <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              animate={{ x: [0, -100, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <svg
                viewBox="0 0 1440 120"
                className="w-[200%] h-32 fill-white/5"
              >
                <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple Loading Spinner for inline use
export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="w-8 h-8 border-3 border-[#ef233c]/30 border-t-[#ef233c] rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// Page Loading Component
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <motion.img
            src="https://vesit.ves.ac.in/navbar2024nobackground.png"
            alt="VESIT"
            className="h-16 w-auto mx-auto mb-4"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <LoadingSpinner className="mx-auto" />
          <motion.p
            className="mt-4 text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
