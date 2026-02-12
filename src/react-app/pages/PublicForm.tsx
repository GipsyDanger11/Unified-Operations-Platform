import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { api } from "@/react-app/lib/api";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/react-app/components/ui/select";
import { Checkbox } from "@/react-app/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/react-app/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/react-app/components/ui/alert";

interface FormField {
    _id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
}

interface FormTemplate {
    _id: string;
    name: string;
    description: string;
    fields: FormField[];
}

export default function PublicFormPage() {
    const { formId } = useParams();
    const [form, setForm] = useState<FormTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});

    useEffect(() => {
        const fetchForm = async () => {
            if (!formId) return;
            try {
                const data = await api.getPublicForm(formId);
                setForm(data);
            } catch (err) {
                setError("Form not found or unavailable.");
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [formId]);

    const handleInputChange = (fieldLabel: string, value: any) => {
        setFormData((prev) => ({ ...prev, [fieldLabel]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formId) return;

        setSubmitting(true);
        setError(null);

        // Basic validation
        if (form) {
            for (const field of form.fields) {
                if (field.required && !formData[field.label]) {
                    setError(`Please fill out the required field: ${field.label}`);
                    setSubmitting(false);
                    return;
                }
            }
        }

        try {
            await api.submitPublicForm(formId, formData);
            setSuccess(true);
        } catch (err) {
            setError("Failed to submit form. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (error && !form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-md w-full border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> Error
                        </CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-md w-full border-green-200 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle className="text-green-900">Submission Received</CardTitle>
                        <CardDescription>Thank you! Your response has been recorded.</CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Submit Another Response
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg border-purple-100">
                    <CardHeader className="bg-purple-50/50 border-b border-purple-100 mb-6">
                        <CardTitle className="text-2xl text-purple-900">{form?.name}</CardTitle>
                        {form?.description && <CardDescription className="text-purple-700">{form.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {form?.fields.map((field) => (
                                <div key={field._id} className="space-y-2">
                                    <Label className="flex gap-1">
                                        {field.label}
                                        {field.required && <span className="text-red-500">*</span>}
                                    </Label>

                                    {field.type === "text" && (
                                        <Input
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                        />
                                    )}

                                    {field.type === "email" && (
                                        <Input
                                            type="email"
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                        />
                                    )}

                                    {field.type === "phone" && (
                                        <Input
                                            type="tel"
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                        />
                                    )}

                                    {field.type === "textarea" && (
                                        <Textarea
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                        />
                                    )}

                                    {field.type === "select" && (
                                        <Select onValueChange={(val) => handleInputChange(field.label, val)} required={field.required}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={field.placeholder || "Select an option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {field.type === "checkbox" && (
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={field._id}
                                                onCheckedChange={(checked) => handleInputChange(field.label, checked)}
                                            />
                                            <label htmlFor={field._id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {field.placeholder || "Yes"}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Form"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Powered by <span className="font-semibold text-purple-600">Unified Ops</span>
                </div>
            </div>
        </div>
    );
}
