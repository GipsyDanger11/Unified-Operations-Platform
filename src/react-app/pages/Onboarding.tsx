import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import WaveBackground from "@/react-app/components/WaveBackground";
import WorkspaceStep from "@/react-app/components/onboarding/WorkspaceStep";
import CommunicationStep from "@/react-app/components/onboarding/CommunicationStep";
import ContactFormStep from "@/react-app/components/onboarding/ContactFormStep";
import BookingStep from "@/react-app/components/onboarding/BookingStep";
import { api } from "@/react-app/lib/api";
import { useNavigate } from "react-router";

// Define all 8 steps
const steps = [
  { id: 1, name: "Workspace", component: WorkspaceStep },
  { id: 2, name: "Communication", component: CommunicationStep },
  { id: 3, name: "Contact Form", component: ContactFormStep },
  { id: 4, name: "Booking Setup", component: BookingStep },
  { id: 5, name: "Forms", component: BookingStep }, // Reusing component for demo speed, ideally specific FormStep
  { id: 6, name: "Inventory", component: BookingStep }, // Reusing component for demo speed
  { id: 7, name: "Staff", component: BookingStep }, // Reusing component for demo speed
  { id: 8, name: "Activation", component: WorkspaceStep }, // Reusing component for demo speed
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await api.getOnboardingStatus();
        if (status.step && status.step > 1) {
          setCurrentStep(status.step);
        }
      } catch (err) {
        // Ignore error if not logged in or first time
      }
    };
    loadStatus();
  }, []);

  const CurrentStepComponent = steps.find((s) => s.id === currentStep)?.component || WorkspaceStep;

  const handleNext = async (stepData: Record<string, any>) => {
    const newData = { ...formData, ...stepData };
    setFormData(newData);

    setIsSubmitting(true);
    try {
      // Save step to backend
      await api.completeOnboardingStep(currentStep, stepData);

      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - Activate
        await api.activateWorkspace();
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Failed to save step:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen relative">
      <WaveBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-purple-200 bg-white/80 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <span className="font-bold text-lg">U</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg text-purple-950">Unified Ops</h1>
                  <p className="text-xs text-purple-700">Setup Wizard</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-purple-700 hover:text-purple-900" onClick={() => navigate("/dashboard")}>
                Skip & Exit
              </Button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="border-b border-purple-200 bg-white/60 backdrop-blur-sm overflow-x-auto">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between max-w-5xl mx-auto min-w-[600px]">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2 relative">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs
                        transition-all duration-300
                        ${step.id < currentStep
                          ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                          : step.id === currentStep
                            ? "bg-purple-100 text-purple-900 ring-4 ring-purple-200"
                            : "bg-white border-2 border-purple-200 text-purple-400"
                        }
                      `}
                    >
                      {step.id < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`
                        text-[10px] font-medium whitespace-nowrap uppercase tracking-wider
                        ${step.id === currentStep ? "text-purple-900" : "text-purple-400"}
                      `}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 -mt-6">
                      <div
                        className={`h-full transition-all duration-300 ${step.id < currentStep ? "bg-purple-500" : "bg-purple-100"
                          }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-purple-700">Saving progress...</p>
              </div>
            ) : (
              <CurrentStepComponent
                data={formData}
                onNext={handleNext}
                onBack={handleBack}
                isFirstStep={currentStep === 1}
                isLastStep={currentStep === steps.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
