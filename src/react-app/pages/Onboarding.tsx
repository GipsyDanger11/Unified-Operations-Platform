import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import WaveBackground from "@/react-app/components/WaveBackground";
import WorkspaceStep from "@/react-app/components/onboarding/WorkspaceStep";
import CommunicationStep from "@/react-app/components/onboarding/CommunicationStep";
import ContactFormStep from "@/react-app/components/onboarding/ContactFormStep";
import BookingStep from "@/react-app/components/onboarding/BookingStep";

const steps = [
  { id: 1, name: "Workspace", component: WorkspaceStep },
  { id: 2, name: "Communication", component: CommunicationStep },
  { id: 3, name: "Contact Form", component: ContactFormStep },
  { id: 4, name: "Booking Setup", component: BookingStep },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const CurrentStepComponent = steps.find((s) => s.id === currentStep)?.component || WorkspaceStep;

  const handleNext = (stepData: Record<string, any>) => {
    setFormData({ ...formData, ...stepData });
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
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
              <Button variant="ghost" size="sm" className="text-purple-700 hover:text-purple-900">
                Save & Exit
              </Button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="border-b border-purple-200 bg-white/60 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2 relative">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                        transition-all duration-300
                        ${
                          step.id < currentStep
                            ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                            : step.id === currentStep
                            ? "bg-purple-100 text-purple-900 ring-4 ring-purple-200"
                            : "bg-white border-2 border-purple-200 text-purple-400"
                        }
                      `}
                    >
                      {step.id < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`
                        text-xs font-medium whitespace-nowrap
                        ${step.id === currentStep ? "text-purple-900" : "text-purple-600"}
                      `}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 -mt-8">
                      <div
                        className={`h-full transition-all duration-300 ${
                          step.id < currentStep ? "bg-purple-500" : "bg-purple-200"
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
          <div className="max-w-5xl mx-auto">
            <CurrentStepComponent
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
              isFirstStep={currentStep === 1}
              isLastStep={currentStep === steps.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
