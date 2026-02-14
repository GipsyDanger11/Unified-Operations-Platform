
import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import { Checkbox } from "@/react-app/components/ui/checkbox";

interface FormsStepProps {
    data: Record<string, any>;
    onNext: (data: Record<string, any>) => void;
    onBack: () => void;
    title?: string;
}

export default function FormsStep({ data, onNext, onBack, title }: FormsStepProps) {
    const [formName, setFormName] = useState(data.formName || "New Client Intake");
    const [formType, setFormType] = useState(data.formType || "intake");

    // Simple field selection for demo
    const [includeName, setIncludeName] = useState(true);
    const [includeEmail, setIncludeEmail] = useState(true);
    const [includePhone, setIncludePhone] = useState(true);
    const [includeNotes, setIncludeNotes] = useState(true);

    const handleNext = () => {
        onNext({
            formName,
            formType,
            formFields: {
                includeName,
                includeEmail,
                includePhone,
                includeNotes
            }
        });
    };

    const isValid = formName.length > 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-purple-950">{title || "Forms Setup"}</h2>
                <p className="text-purple-700 mt-2">Create forms to collect information from your clients</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-purple-950">Create Form</CardTitle>
                            <CardDescription>Set up a basic form to get started</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="formName" className="text-purple-900">Form Name</Label>
                                <Input
                                    id="formName"
                                    placeholder="e.g., Client Intake Form"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="bg-white border-purple-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="formType" className="text-purple-900">Form Type</Label>
                                <Select value={formType} onValueChange={setFormType}>
                                    <SelectTrigger id="formType" className="bg-white border-purple-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="intake">Intake Form (Collect Info)</SelectItem>
                                        <SelectItem value="agreement">Agreement / Waiver (Signatures)</SelectItem>
                                        <SelectItem value="feedback">Feedback Survey</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label className="text-purple-900">Fields to Include</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2 border rounded-md p-3 bg-white border-purple-100">
                                        <Checkbox id="f-name" checked={includeName} onCheckedChange={(c) => setIncludeName(!!c)} />
                                        <Label htmlFor="f-name" className="cursor-pointer">Full Name</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-md p-3 bg-white border-purple-100">
                                        <Checkbox id="f-email" checked={includeEmail} onCheckedChange={(c) => setIncludeEmail(!!c)} />
                                        <Label htmlFor="f-email" className="cursor-pointer">Email Address</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-md p-3 bg-white border-purple-100">
                                        <Checkbox id="f-phone" checked={includePhone} onCheckedChange={(c) => setIncludePhone(!!c)} />
                                        <Label htmlFor="f-phone" className="cursor-pointer">Phone Number</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-md p-3 bg-white border-purple-100">
                                        <Checkbox id="f-notes" checked={includeNotes} onCheckedChange={(c) => setIncludeNotes(!!c)} />
                                        <Label htmlFor="f-notes" className="cursor-pointer">Notes / Message</Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview */}
                <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-sm text-purple-900">Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-lg bg-white border border-purple-100 shadow-sm space-y-4">
                                <div className="border-b pb-2 mb-2">
                                    <h3 className="font-bold text-gray-900 text-sm">{formName || "Untitled Form"}</h3>
                                    <p className="text-xs text-gray-500">Please fill out this form.</p>
                                </div>

                                {includeName && (
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-medium text-gray-500 uppercase">Full Name</div>
                                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center text-xs text-gray-400">
                                            John Doe
                                        </div>
                                    </div>
                                )}
                                {includeEmail && (
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-medium text-gray-500 uppercase">Email</div>
                                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center text-xs text-gray-400">
                                            john@example.com
                                        </div>
                                    </div>
                                )}
                                {includePhone && (
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-medium text-gray-500 uppercase">Phone</div>
                                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center text-xs text-gray-400">
                                            (555) 123-4567
                                        </div>
                                    </div>
                                )}
                                {includeNotes && (
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-medium text-gray-500 uppercase">Notes</div>
                                        <div className="h-16 bg-white border border-gray-200 rounded p-2 text-xs text-gray-400">
                                            I have a question about...
                                        </div>
                                    </div>
                                )}

                                <div className="h-8 bg-purple-600 rounded w-24 flex items-center justify-center text-xs text-white font-medium shadow-sm">
                                    Submit
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-purple-600 mt-1" />
                            <div>
                                <h4 className="text-sm font-semibold text-purple-900 mb-1">Automated Collection</h4>
                                <p className="text-xs text-purple-700">
                                    Forms can be automatically sent to clients via email or SMS when they book a service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between gap-3 pt-4">
                <Button onClick={onBack} variant="outline">
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!isValid}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
                >
                    Create & Continue
                </Button>
            </div>
        </div>
    );
}
