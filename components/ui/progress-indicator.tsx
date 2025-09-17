"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description?: string
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted
                      ? "hsl(var(--primary))"
                      : isCurrent
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted))",
                    borderColor: isCompleted
                      ? "hsl(var(--primary))"
                      : isCurrent
                        ? "hsl(var(--primary))"
                        : "hsl(var(--border))",
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                    "transition-colors duration-200",
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </motion.div>
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-primary-foreground" : "text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </motion.div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-24">{step.description}</p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: index < currentStep ? "hsl(var(--primary))" : "hsl(var(--border))",
                  }}
                  className="h-0.5 w-16 mx-4 transition-colors duration-200"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
