import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/react-app/components/ui/dialog";
import { Button } from "@/react-app/components/ui/button";
import { ScrollArea } from "@/react-app/components/ui/scroll-area";
import { Badge } from "@/react-app/components/ui/badge";
import { FileText, User, Mail, Calendar } from "lucide-react";

interface SubmissionDetailsDialogProps {
    submission: any;
    children: React.ReactNode;
}

export function SubmissionDetailsDialog({ submission, children }: SubmissionDetailsDialogProps) {
    if (!submission) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl text-purple-950">
                        <FileText className="w-6 h-6 text-purple-600" />
                        Submission Details
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-600" />
                            <div className="text-sm font-medium">
                                {submission.contact?.firstName} {submission.contact?.lastName}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-purple-600" />
                            <div className="text-sm text-gray-600 truncate">{submission.contact?.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <div className="text-sm text-gray-600">
                                {new Date(submission.completedAt || submission.sentAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                                {submission.form?.name}
                            </Badge>
                        </div>
                    </div>

                    <h3 className="font-semibold text-purple-900 mt-2">Form Responses</h3>
                    <ScrollArea className="flex-grow pr-4">
                        <div className="space-y-4">
                            {submission.responses && Object.entries(submission.responses).map(([label, value]: [string, any]) => (
                                <div key={label} className="border-b border-gray-100 pb-3 last:border-0">
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</div>
                                    <div className="text-gray-900 bg-white p-2 rounded border border-gray-50">
                                        {typeof value === 'boolean' ? (value ? "Yes" : "No") : (value?.toString() || "N/A")}
                                    </div>
                                </div>
                            ))}
                            {(!submission.responses || Object.keys(submission.responses).length === 0) && (
                                <div className="text-center py-8 text-gray-400 italic">
                                    No response data available for this submission.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <div className="flex justify-end pt-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="border-purple-200">Close</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}
