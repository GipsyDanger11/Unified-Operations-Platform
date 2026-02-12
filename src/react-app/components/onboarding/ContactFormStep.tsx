import { useState } from "react";
import { Plus, Trash2, GripVertical, Copy, Link2, Code } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Switch } from "@/react-app/components/ui/switch";
import { Badge } from "@/react-app/components/ui/badge";

interface ContactFormStepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack: () => void;
}

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  enabled: boolean;
}

const defaultFields: FormField[] = [
  { id: "name", label: "Full Name", type: "text", required: true, enabled: true },
  { id: "email", label: "Email Address", type: "email", required: true, enabled: true },
  { id: "phone", label: "Phone Number", type: "tel", required: false, enabled: true },
  { id: "message", label: "Message", type: "textarea", required: true, enabled: true },
];

export default function ContactFormStep({ data, onNext, onBack }: ContactFormStepProps) {
  const [fields, setFields] = useState<FormField[]>(data.formFields || defaultFields);
  const [showPublicLink, setShowPublicLink] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  const publicUrl = "https://forms.unifiedops.app/contact/acme-services";
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const toggleField = (id: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  };

  const toggleRequired = (id: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, required: !f.required } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const addCustomField = () => {
    const newField: FormField = {
      id: `custom_${Date.now()}`,
      label: "Custom Field",
      type: "text",
      required: false,
      enabled: true,
    };
    setFields([...fields, newField]);
  };

  const handleNext = () => {
    onNext({ formFields: fields });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-purple-950">Public Contact Form</h2>
        <p className="text-purple-700 mt-2">Build your contact form and share it with customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Builder */}
        <div className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-950">Form Fields</CardTitle>
              <CardDescription>Drag to reorder, toggle to enable/disable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${field.enabled ? "bg-white border-purple-200" : "bg-gray-50 border-gray-200 opacity-60"}
                  `}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-purple-900">{field.label}</div>
                    <div className="text-xs text-purple-600 flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {field.type}
                      </Badge>
                      {field.required && (
                        <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRequired(field.id)}
                      className="text-xs px-2 py-1 rounded hover:bg-purple-50 text-purple-700"
                      disabled={!field.enabled}
                    >
                      {field.required ? "Optional" : "Required"}
                    </button>
                    <Switch checked={field.enabled} onCheckedChange={() => toggleField(field.id)} />
                    {!field.required && field.id.startsWith("custom_") && (
                      <button
                        onClick={() => removeField(field.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <Button onClick={addCustomField} variant="outline" className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Field
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-950">Share Your Form</CardTitle>
              <CardDescription>Get your public link or embed code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-purple-900">Public Link</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPublicLink(!showPublicLink)}
                    className="text-xs"
                  >
                    {showPublicLink ? "Hide" : "Show"}
                  </Button>
                </div>
                {showPublicLink && (
                  <div className="flex gap-2">
                    <Input
                      value={publicUrl}
                      readOnly
                      className="bg-purple-50 border-purple-200 font-mono text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(publicUrl)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-purple-900">Embed Code</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowEmbedCode(!showEmbedCode)}
                    className="text-xs"
                  >
                    {showEmbedCode ? "Hide" : "Show"}
                  </Button>
                </div>
                {showEmbedCode && (
                  <div className="space-y-2">
                    <textarea
                      value={embedCode}
                      readOnly
                      rows={3}
                      className="w-full p-3 rounded-lg bg-purple-50 border border-purple-200 font-mono text-xs resize-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(embedCode)}
                      className="w-full"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Copy Embed Code
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-sm text-purple-900 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <h3 className="text-xl font-bold text-purple-950 mb-2">Contact Us</h3>
                <p className="text-sm text-purple-700 mb-6">
                  Fill out the form below and we'll get back to you soon.
                </p>
                <div className="space-y-4">
                  {fields
                    .filter((f) => f.enabled)
                    .map((field) => (
                      <div key={field.id}>
                        <Label className="text-purple-900 text-xs">
                          {field.label}
                          {field.required && <span className="text-red-600 ml-1">*</span>}
                        </Label>
                        {field.type === "textarea" ? (
                          <textarea
                            rows={3}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-purple-200 text-sm resize-none"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        ) : (
                          <Input
                            type={field.type}
                            className="mt-1 bg-white border-purple-200 text-sm h-9"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 mt-2" size="sm">
                    Submit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
