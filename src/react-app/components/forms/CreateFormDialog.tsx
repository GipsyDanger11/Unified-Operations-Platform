import { useState, useEffect } from "react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/react-app/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/react-app/components/ui/select";
import { Plus, Trash2, GripVertical, Loader2, Send, Save, Users } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/react-app/lib/api";

interface Question {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[]; // For select fields
}

interface CreateFormDialogProps {
    onFormCreated: () => void;
    children: React.ReactNode;
    initialData?: any; // Form template data for editing
}

export function CreateFormDialog({ onFormCreated, children, initialData }: CreateFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Builder, 2: Send (optional)

    // Form State
    const [title, setTitle] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [questions, setQuestions] = useState<Question[]>(
        initialData?.fields || [
            { id: "1", label: "Full Name", type: "text", required: true },
            { id: "2", label: "Email Address", type: "email", required: true },
        ]
    );

    // Update state when initialData changes
    useState(() => {
        if (initialData) {
            setTitle(initialData.name);
            setDescription(initialData.description);
            // Ensure fields have IDs for the UI builder
            const fieldsWithIds = initialData.fields.map((f: any, index: number) => ({
                ...f,
                id: f.id || Date.now().toString() + index // Fallback if no ID
            }));
            setQuestions(fieldsWithIds);
        }
    });

    // Send State
    const [recipientEmail, setRecipientEmail] = useState("");
    const [createdFormId, setCreatedFormId] = useState<string | null>(null);
    const [staffMembers, setStaffMembers] = useState<any[]>([]);
    const [sendingToTeam, setSendingToTeam] = useState(false);

    // Fetch staff when step 2 is shown
    useEffect(() => {
        if (step === 2) {
            api.getStaff().then(data => {
                setStaffMembers(data.staff || []);
            }).catch(err => console.error('Failed to fetch staff:', err));
        }
    }, [step]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: Date.now().toString(),
                label: "New Question",
                type: "text",
                required: false,
            },
        ]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions(
            questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
        );
    };

    const handleSave = async (sendImmediately: boolean) => {
        if (!title) {
            toast.error("Please enter a form title");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Template
            const formData = {
                name: title,
                description,
                type: "custom",
                fields: questions.map(({ id, ...rest }) => rest), // Remove ID before sending
                linkedToServiceTypes: [],
            };

            let formId;
            if (initialData) {
                // Update existing
                const response = await api.updateFormTemplate(initialData._id, formData);
                formId = response.form._id;
                toast.success("Form template updated!");
            } else {
                // Create new
                const response = await api.createFormTemplate(formData);
                formId = response.form._id;
                toast.success("Form template created!");
            }

            setCreatedFormId(formId);
            onFormCreated();

            if (sendImmediately) {
                setStep(2);
            } else {
                setOpen(false);
                resetForm();
            }
        } catch (error: any) {
            console.error("Form save error:", error);
            toast.error(error.message || "Failed to save form");
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!recipientEmail || !createdFormId) return;

        setLoading(true);
        try {
            await api.sendForm(createdFormId, recipientEmail);

            toast.success(`Form sent to ${recipientEmail}`);
            setOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Failed to send email");
        } finally {
            setLoading(false);
        }
    };

    const handleSendToTeam = async () => {
        if (!createdFormId || staffMembers.length === 0) return;

        setSendingToTeam(true);
        try {
            const results = await Promise.allSettled(
                staffMembers.map(member => api.sendForm(createdFormId, member.email))
            );
            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            if (failed > 0) {
                toast.warning(`Sent to ${succeeded} team members, ${failed} failed`);
            } else {
                toast.success(`Form sent to all ${succeeded} team members!`);
            }
            setOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Failed to send form to team");
        } finally {
            setSendingToTeam(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setQuestions([
            { id: "1", label: "Full Name", type: "text", required: true },
            { id: "2", label: "Email Address", type: "email", required: true },
        ]);
        setStep(1);
        setRecipientEmail("");
        setCreatedFormId(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{step === 1 ? (initialData ? "Edit Form Template" : "Create New Form") : "Send Form"}</DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Design your form by adding questions below."
                            : "Send this form to a client via email."}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Form Title</Label>
                                <Input
                                    placeholder="e.g. Client Onboarding Intake"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Textarea
                                    placeholder="Briefly describe what this form is for..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <Label className="text-base">Questions</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addQuestion}
                                    className="h-8"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Question
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {questions.map((q) => (
                                    <div
                                        key={q.id}
                                        className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border group"
                                    >
                                        <div className="mt-3 text-slate-400 cursor-move">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <Input
                                                value={q.label}
                                                onChange={(e) =>
                                                    updateQuestion(q.id, "label", e.target.value)
                                                }
                                                placeholder="Question Label"
                                                className="bg-white"
                                            />
                                            <div className="flex gap-3">
                                                <Select
                                                    value={q.type}
                                                    onValueChange={(value) =>
                                                        updateQuestion(q.id, "type", value)
                                                    }
                                                >
                                                    <SelectTrigger className="w-[140px] bg-white h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Short Text</SelectItem>
                                                        <SelectItem value="textarea">Long Text</SelectItem>
                                                        <SelectItem value="email">Email</SelectItem>
                                                        <SelectItem value="phone">Phone</SelectItem>
                                                        <SelectItem value="checkbox">Checkbox</SelectItem>
                                                        <SelectItem value="select">Dropdown</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <div className="flex items-center space-x-2 pt-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`req-${q.id}`}
                                                        checked={q.required}
                                                        onChange={(e) => updateQuestion(q.id, "required", e.target.checked)}
                                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <Label htmlFor={`req-${q.id}`} className="text-xs font-normal text-muted-foreground">Required</Label>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeQuestion(q.id)}
                                            className="text-slate-400 hover:text-red-500 h-8 w-8"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Recipient Email</Label>
                            <Input
                                type="email"
                                placeholder="client@example.com"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Link to form: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">/forms/public/{createdFormId}</code>
                            </p>
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">or</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={handleSendToTeam}
                            disabled={sendingToTeam || staffMembers.length === 0}
                        >
                            {sendingToTeam ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Users className="w-4 h-4 mr-2" />
                            )}
                            Send to All Team Members ({staffMembers.length})
                        </Button>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {step === 1 ? (
                        <>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleSave(false)}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Template
                                </Button>
                                <Button
                                    onClick={() => handleSave(true)}
                                    disabled={loading}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            Save & Send <Send className="w-3 h-3 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Close
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={loading || !recipientEmail}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Email"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
