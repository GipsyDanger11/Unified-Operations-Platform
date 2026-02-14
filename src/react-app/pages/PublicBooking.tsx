import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import WaveBackground from "@/react-app/components/WaveBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle, Calendar as CalendarIcon, Clock, Building2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/react-app/components/ui/alert";

interface BookingFormState {
    serviceType: string;
    date: string;
    time: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
}

// Service type definition
interface ServiceType {
    _id: string;
    name: string;
    duration: number;
    description?: string;
    price?: number;
}

interface Workspace {
    _id: string;
    businessName: string;
    address?: string;
}

export default function PublicBookingPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const workspaceId = searchParams.get("workspace");

    const [step, setStep] = useState(1);
    const [services, setServices] = useState<ServiceType[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [businessName, setBusinessName] = useState("");

    const [formData, setFormData] = useState<BookingFormState>({
        serviceType: "",
        date: "",
        time: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Directory State
    const [showDirectory, setShowDirectory] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loadingDirectory, setLoadingDirectory] = useState(false);

    useEffect(() => {
        if (!workspaceId || workspaceId === "DEMO") {
            setShowDirectory(true);
            fetchDirectory();
            return;
        }

        const fetchServices = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/public/services/${workspaceId}`);
                if (!response.ok) {
                    // If backend says 404/invalid, fallback to directory
                    if (response.status === 404 || response.status === 400) {
                        setShowDirectory(true);
                        fetchDirectory();
                        return;
                    }
                    throw new Error("Failed to load services");
                }
                const data = await response.json();
                setServices(data.services || []);
                setBusinessName(data.businessName || "");
            } catch (err) {
                console.error("Error loading services:", err);
                setError("Failed to load available services. Please contact the business directly.");
            } finally {
                setLoadingServices(false);
            }
        };

        fetchServices();
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
        setLoadingServices(true); // Reset for new fetch
        setStep(1);
        setError(null);
    };

    const handleServiceSelect = (serviceId: string) => {
        setFormData((prev) => ({ ...prev, serviceType: serviceId }));
        setStep(2);
    };

    const handleDateTimeSelect = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.date && formData.time) {
            setStep(3);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workspaceId) {
            setError("Invalid workspace link");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // In a real app, we would validate availability here first

            const selectedService = services.find(s => s._id === formData.serviceType);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/public/${workspaceId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    serviceName: selectedService?.name || "Unknown Service",
                    duration: selectedService?.duration || 60,
                    // Combine date and time into ISO string
                    dateTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
                    workspaceId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create booking");
            }

            setIsSuccess(true);
        } catch (err) {
            setError("Failed to book appointment. Please try again.");
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

    if (showDirectory) {
        return (
            <div className="h-screen w-full bg-transparent relative overflow-hidden flex items-center justify-center">
                <WaveBackground />
                <div className="relative z-10 w-full max-w-4xl px-4 h-full max-h-[90vh] flex flex-col">
                    <Card className="backdrop-blur-sm bg-white/90 border-purple-100 shadow-xl flex-1 flex flex-col overflow-hidden">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-3xl text-purple-900">Book an Appointment</CardTitle>
                            <CardDescription className="text-lg">
                                Select a business to view available services
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
                            <h2 className="text-2xl font-semibold text-green-900">Booking Confirmed!</h2>
                            <p className="text-green-700">
                                Your appointment has been scheduled. Check your email for confirmation details.
                            </p>
                            <div className="bg-white p-4 rounded-lg border border-green-100 mt-4 text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{new Date(formData.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{formData.time}</span>
                                </div>
                            </div>
                            <Button
                                className="mt-4 w-full bg-green-600 hover:bg-green-700"
                                onClick={() => window.location.reload()}
                            >
                                Book Another
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
            <div className="relative z-10 w-full max-w-2xl px-4">
                <Card className="backdrop-blur-sm bg-white/90 border-purple-100 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-purple-900">
                            {businessName ? `Book with ${businessName}` : "Book an Appointment"}
                        </CardTitle>
                        <CardDescription>
                            Select a service and time that works for you.
                        </CardDescription>

                        {/* Progress Steps */}
                        <div className="flex justify-between items-center mt-6 mb-2">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${step >= s ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-400"
                                        }`}
                                >
                                    {s}
                                </div>
                            ))}
                            <div className="absolute left-0 right-0 h-1 bg-purple-100 -z-10 mx-10 top-[116px]" />
                        </div>
                        <div className="flex justify-between text-xs text-purple-600 px-2">
                            <span>Service</span>
                            <span>Date & Time</span>
                            <span>Details</span>
                        </div>
                    </CardHeader>

                    <CardContent className="mt-4">
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="font-medium text-lg text-gray-900">Select Service</h3>
                                {loadingServices ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                    </div>
                                ) : services.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No services available for booking at this time.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {services.map((service) => (
                                            <button
                                                key={service._id}
                                                onClick={() => handleServiceSelect(service._id)}
                                                className="flex items-center justify-between p-4 rounded-lg border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
                                            >
                                                <div>
                                                    <div className="font-medium text-purple-900">{service.name}</div>
                                                    <div className="text-sm text-purple-600">{service.duration} min</div>
                                                    {service.description && (
                                                        <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                                                    )}
                                                </div>
                                                <div className="h-5 w-5 rounded-full border-2 border-purple-200 group-hover:border-purple-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleDateTimeSelect} className="space-y-6">
                                <h3 className="font-medium text-lg text-gray-900">Select Date & Time</h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            name="date"
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="h-12"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time">Time</Label>
                                        <Input
                                            id="time"
                                            name="time"
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={handleChange}
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                                        Back
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                                        Continue
                                    </Button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="font-medium text-lg text-gray-900">Your Details</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
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
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg space-y-2 text-sm text-purple-900">
                                    <div className="font-medium">Booking Summary:</div>
                                    <div className="flex justify-between">
                                        <span>Service:</span>
                                        <span className="font-medium">{services.find(s => s._id === formData.serviceType)?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date:</span>
                                        <span className="font-medium">{new Date(formData.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Time:</span>
                                        <span className="font-medium">{formData.time}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Confirming...
                                            </>
                                        ) : (
                                            "Confirm Booking"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
