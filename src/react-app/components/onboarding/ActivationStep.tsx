
import { useState } from "react";
import { Rocket, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent } from "@/react-app/components/ui/card";

interface ActivationStepProps {
    onNext: (data: Record<string, any>) => void;
}

export default function ActivationStep({ onNext }: ActivationStepProps) {
    const [isLaunching, setIsLaunching] = useState(false);

    const handleLaunch = () => {
        setIsLaunching(true);
        // Determine data to send? Usually none needed for activation
        onNext({});
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-500/30 mx-auto transform -rotate-12">
                    <Rocket className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-purple-950">Ready to Launch!</h2>
                <p className="text-purple-700 max-w-md mx-auto">
                    Your workspace is configured and ready for action. Click below to activate your account and access the dashboard.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-purple-900">Communication</span>
                        </div>
                        <p className="text-sm text-purple-600 pl-11">
                            Email integration configured via Gmail SMTP
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-purple-900">Bookings</span>
                        </div>
                        <p className="text-sm text-purple-600 pl-11">
                            Services and scheduling rules set
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-purple-900">Inventory</span>
                        </div>
                        <p className="text-sm text-purple-600 pl-11">
                            Item tracking initialized
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-purple-900">Team</span>
                        </div>
                        <p className="text-sm text-purple-600 pl-11">
                            Staff permissions and access control
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center pt-8">
                <Button
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl shadow-purple-500/30 px-8 py-6 text-lg"
                >
                    {isLaunching ? "Launching..." : (
                        <>
                            Launch Workspace <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
