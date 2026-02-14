import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/react-app/components/ui/table";
import { FileText, Plus, ExternalLink, Clock, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { api } from "@/react-app/lib/api";
import { CreateFormDialog } from "@/react-app/components/forms/CreateFormDialog";
import { SubmissionDetailsDialog } from "@/react-app/components/forms/SubmissionDetailsDialog";
import { toast } from "react-toastify";

interface FormTemplate {
  _id: string;
  name: string;
  description: string;
  linkedServiceTypes: string[];
}

interface FormSubmission {
  _id: string;
  form: FormTemplate;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'completed';
  sentAt: string;
  completedAt?: string;
  answers?: any[];
}

export default function FormsPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [activeTab, setActiveTab] = useState("submissions");
  const [loading, setLoading] = useState(true);


  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesData, submissionsData] = await Promise.all([
        api.getFormTemplates(),
        api.getFormSubmissions()
      ]);
      setTemplates(templatesData.forms || []);
      setSubmissions(submissionsData.submissions || []);
    } catch (error) {
      console.error("Failed to fetch forms data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTemplate = (templateId: string) => {
    const toastId = toast(
      <div>
        <p className="font-medium text-gray-900 mb-1">Delete this form template?</p>
        <p className="text-sm text-gray-500 mb-3">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => toast.dismiss(toastId)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            onClick={async () => {
              toast.dismiss(toastId);
              try {
                await api.deleteFormTemplate(templateId);
                toast.success("Form template deleted successfully");
                const templatesData = await api.getFormTemplates();
                setTemplates(templatesData.forms || []);
              } catch (error: any) {
                console.error("Failed to delete template:", error);
                toast.error(error.message || "Failed to delete form template");
              }
            }}
          >
            Confirm
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, closeButton: false }
    );
  };

  const handleDeleteSubmission = (submissionId: string) => {
    const toastId = toast(
      <div>
        <p className="font-medium text-gray-900 mb-1">Delete this submission?</p>
        <p className="text-sm text-gray-500 mb-3">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => toast.dismiss(toastId)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            onClick={async () => {
              toast.dismiss(toastId);
              try {
                await api.deleteFormSubmission(submissionId);
                toast.success("Submission deleted successfully");
                setSubmissions(prev => prev.filter(s => s._id !== submissionId));
              } catch (error: any) {
                console.error("Failed to delete submission:", error);
                toast.error(error.message || "Failed to delete submission");
              }
            }}
          >
            Confirm
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, closeButton: false }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-950">Forms</h1>
          <p className="text-purple-700 mt-1">Manage intake forms, agreements, and view submissions.</p>
        </div>
        <CreateFormDialog onFormCreated={() => {
          // Re-fetch templates
          const fetchData = async () => {
            const templatesData = await api.getFormTemplates();
            setTemplates(templatesData.forms || []);
            setActiveTab("templates"); // Switch to templates tab
          };
          fetchData();
        }}>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" /> Create Form
          </Button>
        </CreateFormDialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-purple-50">
          <TabsTrigger value="submissions" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">Submissions</TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-950">Recent Submissions</CardTitle>
              <CardDescription>Track status of forms sent to clients.</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Form Name</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub._id}>
                        <TableCell className="font-medium">
                          {sub.contact?.firstName} {sub.contact?.lastName}
                          <div className="text-xs text-gray-500">{sub.contact?.email}</div>
                        </TableCell>
                        <TableCell>{sub.form?.name || "Unknown Form"}</TableCell>
                        <TableCell>
                          {new Date(sub.sentAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {sub.status === 'completed' ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 flex w-fit items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 flex w-fit items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <SubmissionDetailsDialog submission={sub}>
                              <Button variant="ghost" size="sm" className="text-purple-600">
                                View Details
                              </Button>
                            </SubmissionDetailsDialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-600 h-8 w-8"
                              onClick={() => handleDeleteSubmission(sub._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No submissions found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.length > 0 ? (
              templates.map((template) => (
                <Card key={template._id} className="bg-white border-purple-100 hover:shadow-md transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start text-lg">
                      <span className="text-purple-900 truncate pr-2">{template.name}</span>
                      <FileText className="w-5 h-5 text-purple-300 flex-shrink-0" />
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      {template.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="text-xs text-gray-500 mb-4">
                      Linked to: {template.linkedServiceTypes?.length || 0} services
                    </div>
                    <div className="flex gap-2">
                      <CreateFormDialog
                        initialData={template}
                        onFormCreated={() => {
                          const fetchData = async () => {
                            const templatesData = await api.getFormTemplates();
                            setTemplates(templatesData.forms || []);
                          };
                          fetchData();
                        }}
                      >
                        <Button variant="outline" size="sm">Edit</Button>
                      </CreateFormDialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => handleDeleteTemplate(template._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-600">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No form templates created yet.</p>
                <Button variant="link" className="text-purple-600">Create one now</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
