import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Textarea } from "@/react-app/components/ui/textarea";
import { Label } from "@/react-app/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle, Building2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/react-app/components/ui/alert";
import WaveBackground from "@/react-app/components/WaveBackground";

interface ContactFormState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
}

interface Workspace {
    _id: string;
    businessName: string;
    address?: string;
}

export default function PublicContactPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const workspaceId = searchParams.get("workspace");

    const [formData, setFormData] = useState<ContactFormState>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Demo/Directory Mode State
    const [showDirectory, setShowDirectory] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loadingDirectory, setLoadingDirectory] = useState(false);
    const [businessName, setBusinessName] = useState("");

    useEffect(() => {
        // If no workspace or explicit DEMO, show directory
        if (!workspaceId || workspaceId === "DEMO") {
            setShowDirectory(true);
            fetchDirectory();
            return;
        }

        const fetchWorkspaceDetails = async () => {
            try {
                // We reuse the services endpoint as it returns businessName
                const response = await fetch(`${import.meta.env.VITE_API_URL}/public/services/${workspaceId}`);
                if (response.ok) {
                    const data = await response.json();
                    setBusinessName(data.businessName);
                }
            } catch (err) {
                console.error("Failed to fetch workspace details");
            }
        };

        fetchWorkspaceDetails();
    }, [workspaceId]);

    const fetchDirectory = async () => {
        setLoadingDirectory(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/public/workspaces`);
            if (response.ok) {
                const data = await response.json();
                setWorkspaces(data);
            }
        } catch (err) {
            console.error("Failed to fetch directory");
        } finally {
            setLoadingDirectory(false);
        }
    };

    const handleWorkspaceSelect = (id: string) => {
        setSearchParams({ workspace: id });
        setShowDirectory(false);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workspaceId || workspaceId === "DEMO") {
            setError("Please select a business first.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/public/submit/${workspaceId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit form");
            }

            setIsSuccess(true);
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                message: "",
            });
        } catch (err) {
            setError("Something went wrong. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Directory View
    if (showDirectory) {
        return (
            <div className="h-screen w-full bg-transparent relative overflow-hidden flex items-center justify-center">
                <WaveBackground />
                <div className="relative z-10 w-full max-w-4xl px-4 h-full max-h-[90vh] flex flex-col">
                    <Card className="backdrop-blur-sm bg-white/90 border-purple-100 shadow-xl flex-1 flex flex-col overflow-hidden">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-3xl text-purple-900">Select a Business</CardTitle>
                            <CardDescription className="text-lg">
                                Choose which business you would like to contact
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6 pt-2">
                            {loadingDirectory ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                                </div>
                            ) : workspaces.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No active businesses found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {workspaces.map((ws) => (
                                        <button
                                            key={ws._id}
                                            onClick={() => handleWorkspaceSelect(ws._id)}
                                            className="flex items-center p-4 rounded-xl border border-purple-100 bg-white hover:border-purple-300 hover:bg-purple-50 transition-all group text-left shadow-sm hover:shadow-md"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                                                <Building2 className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900 group-hover:text-purple-700">{ws.businessName}</div>
                                                {ws.address && (
                                                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                                        {typeof ws.address === 'string' ? ws.address : 'Location available'}
                                                    </div>
                                                )}
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-500" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="h-screen w-full bg-transparent relative overflow-hidden flex items-center justify-center">
                <WaveBackground />
                <div className="relative z-10 w-full max-w-md px-4">
                    <Card className="border-green-200 bg-green-50/50 backdrop-blur-md shadow-xl">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-semibold text-green-900">Message Sent!</h2>
                            <p className="text-green-700">
                                Thank you for contacting us. We've received your message and will get back to you shortly.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                                onClick={() => setIsSuccess(false)}
                            >
                                Send Another Message
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-transparent relative overflow-hidden flex items-center justify-center">
            <WaveBackground />
            <div className="relative z-10 w-full max-w-xl px-4">
                <Card className="backdrop-blur-sm bg-white/90 border-purple-100 shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-purple-900">
                            {businessName ? `Contact ${businessName}` : "Contact Us"}
                        </CardTitle>
                        <CardDescription>
                            Send us a message and we'll get back to you as soon as possible.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder="How can we help you?"
                                    className="min-h-[120px]"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Message"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
