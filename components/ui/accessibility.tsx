"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Accessibility,
  Type,
  Volume2,
  VolumeX,
  Eye,
  Moon,
  Sun,
  Mic,
  MicOff,
  ZoomIn,
  ZoomOut,
  Contrast,
  Hand,
  Keyboard,
  RotateCcw,
} from "lucide-react";

// Accessibility Settings Interface
interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  darkMode: boolean;
  lineHeight: number;
  letterSpacing: number;
  focusHighlight: boolean;
  readAloud: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  screenReaderMode: false,
  darkMode: false,
  lineHeight: 1.5,
  letterSpacing: 0,
  focusHighlight: true,
  readAloud: false,
};

// Context for accessibility settings
interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
};

// Accessibility Provider Component
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("accessibility-settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load accessibility settings:", e);
      }
    }

    // Initialize speech synthesis
    if (typeof window !== "undefined") {
      setSynthesis(window.speechSynthesis);
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.style.setProperty("--accessibility-font-scale", `${settings.fontSize / 100}`);
    document.body.style.fontSize = `${settings.fontSize}%`;

    // High contrast
    root.classList.toggle("high-contrast", settings.highContrast);

    // Reduced motion
    root.classList.toggle("reduce-motion", settings.reducedMotion);

    // Screen reader mode
    if (settings.screenReaderMode) {
      root.setAttribute("data-screen-reader", "true");
    } else {
      root.removeAttribute("data-screen-reader");
    }

    // Dark mode
    root.classList.toggle("dark", settings.darkMode);

    // Line height
    root.style.setProperty("--accessibility-line-height", `${settings.lineHeight}`);

    // Letter spacing
    root.style.setProperty("--accessibility-letter-spacing", `${settings.letterSpacing}em`);

    // Focus highlight
    root.classList.toggle("focus-visible-enhanced", settings.focusHighlight);

    // Save to localStorage
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem("accessibility-settings");
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (synthesis && settings.readAloud) {
        synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-IN";
        utterance.rate = 0.9;
        synthesis.speak(utterance);
      }
    },
    [synthesis, settings.readAloud]
  );

  const stopSpeaking = useCallback(() => {
    if (synthesis) {
      synthesis.cancel();
    }
  }, [synthesis]);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        speak,
        stopSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

// Toggle Switch Component
function ToggleSwitch({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? "bg-accent" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// Accessibility Panel Component
export function AccessibilityPanel() {
  const { settings, updateSetting, resetSettings, speak, stopSpeaking } = useAccessibility();
  const [open, setOpen] = useState(false);

  const handleSpeak = (text: string) => {
    if (settings.readAloud) {
      speak(text);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-6 z-50 h-12 w-12 rounded-full shadow-lg bg-background border-2 hover:scale-110 transition-transform"
          aria-label="Open accessibility settings"
          onClick={() => handleSpeak("Opening accessibility settings")}
        >
          <Accessibility className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Accessibility className="h-6 w-6 text-accent" />
            Accessibility Settings
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base">
                <Type className="h-4 w-4" />
                Font Size
              </Label>
              <span className="text-sm text-muted-foreground">{settings.fontSize}%</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateSetting("fontSize", Math.max(75, settings.fontSize - 10))}
                aria-label="Decrease font size"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <input
                type="range"
                min={75}
                max={200}
                step={5}
                value={settings.fontSize}
                onChange={(e) => updateSetting("fontSize", Number(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                aria-label="Font size slider"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateSetting("fontSize", Math.min(200, settings.fontSize + 10))}
                aria-label="Increase font size"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Line Height</Label>
              <span className="text-sm text-muted-foreground">{settings.lineHeight.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              step={1}
              value={settings.lineHeight * 10}
              onChange={(e) => updateSetting("lineHeight", Number(e.target.value) / 10)}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
              aria-label="Line height slider"
            />
          </div>

          {/* Letter Spacing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Letter Spacing</Label>
              <span className="text-sm text-muted-foreground">{settings.letterSpacing.toFixed(2)}em</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={settings.letterSpacing * 100}
              onChange={(e) => updateSetting("letterSpacing", Number(e.target.value) / 100)}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
              aria-label="Letter spacing slider"
            />
          </div>

          <hr className="border-border" />

          {/* Toggle Options */}
          <div className="space-y-4">
            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast" className="flex items-center gap-2 cursor-pointer">
                <Contrast className="h-4 w-4" />
                High Contrast Mode
              </Label>
              <ToggleSwitch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting("highContrast", checked)}
              />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center gap-2 cursor-pointer">
                {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Dark Mode
              </Label>
              <ToggleSwitch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting("darkMode", checked)}
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion" className="flex items-center gap-2 cursor-pointer">
                <Hand className="h-4 w-4" />
                Reduced Motion
              </Label>
              <ToggleSwitch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
              />
            </div>

            {/* Focus Highlight */}
            <div className="flex items-center justify-between">
              <Label htmlFor="focus-highlight" className="flex items-center gap-2 cursor-pointer">
                <Keyboard className="h-4 w-4" />
                Enhanced Focus Highlight
              </Label>
              <ToggleSwitch
                id="focus-highlight"
                checked={settings.focusHighlight}
                onCheckedChange={(checked) => updateSetting("focusHighlight", checked)}
              />
            </div>

            {/* Screen Reader Mode */}
            <div className="flex items-center justify-between">
              <Label htmlFor="screen-reader" className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                Screen Reader Optimized
              </Label>
              <ToggleSwitch
                id="screen-reader"
                checked={settings.screenReaderMode}
                onCheckedChange={(checked) => updateSetting("screenReaderMode", checked)}
              />
            </div>
          </div>

          <hr className="border-border" />

          {/* Voice Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Features
            </h3>

            {/* Read Aloud */}
            <div className="flex items-center justify-between">
              <Label htmlFor="read-aloud" className="flex items-center gap-2 cursor-pointer">
                {settings.readAloud ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Read Aloud (Text-to-Speech)
              </Label>
              <ToggleSwitch
                id="read-aloud"
                checked={settings.readAloud}
                onCheckedChange={(checked) => {
                  updateSetting("readAloud", checked);
                  if (checked) {
                    speak("Text to speech enabled");
                  } else {
                    stopSpeaking();
                  }
                }}
              />
            </div>
          </div>

          <hr className="border-border" />

          {/* Reset Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              resetSettings();
              handleSpeak("Settings reset to defaults");
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>

          {/* Keyboard Shortcuts Info */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </h4>
            <ul className="space-y-1 text-muted-foreground">
              <li><kbd className="px-1 bg-background rounded">Ctrl</kbd> + <kbd className="px-1 bg-background rounded">+</kbd> Increase font size</li>
              <li><kbd className="px-1 bg-background rounded">Ctrl</kbd> + <kbd className="px-1 bg-background rounded">-</kbd> Decrease font size</li>
              <li><kbd className="px-1 bg-background rounded">Tab</kbd> Navigate between elements</li>
              <li><kbd className="px-1 bg-background rounded">Esc</kbd> Close dialogs</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Voice Input Button Component
interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

export function VoiceInputButton({ onResult, className = "" }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
    }
  }, []);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
  };

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`${className} ${isListening ? "text-red-500 animate-pulse" : ""}`}
      onClick={toggleListening}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
    >
      {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
    </Button>
  );
}
