import { useState } from "react";
import { Building2, MapPin, Globe, Mail } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";

interface WorkspaceStepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack: () => void;
  isFirstStep: boolean;
}

export default function WorkspaceStep({ data, onNext, isFirstStep }: WorkspaceStepProps) {
  const [formData, setFormData] = useState({
    businessName: data.businessName || "",
    address: data.address || "",
    timeZone: data.timeZone || "America/New_York",
    contactEmail: data.contactEmail || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const isValid = formData.businessName && formData.address && formData.contactEmail;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-purple-950">Create Your Workspace</h2>
        <p className="text-purple-700 mt-2">Let's start by setting up your business information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-950">Business Details</CardTitle>
              <CardDescription>Enter your business information below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-purple-900">Business Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-purple-500" />
                    <Input
                      id="businessName"
                      placeholder="Acme Services Inc."
                      value={formData.businessName}
                      onChange={(e) => updateField("businessName", e.target.value)}
                      className="pl-10 bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-purple-900">Business Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-purple-500" />
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State 12345"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="pl-10 bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeZone" className="text-purple-900">Time Zone</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-purple-500 z-10" />
                    <Select value={formData.timeZone} onValueChange={(value) => updateField("timeZone", value)}>
                      <SelectTrigger className="pl-10 bg-white border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-purple-900">Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-500" />
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@acmeservices.com"
                      value={formData.contactEmail}
                      onChange={(e) => updateField("contactEmail", e.target.value)}
                      className="pl-10 bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={!isValid}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
                  >
                    Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm text-purple-900">Workspace Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg shadow-purple-500/30">
                  {formData.businessName ? formData.businessName[0].toUpperCase() : "?"}
                </div>
                <h3 className="font-bold text-purple-950 mb-1">
                  {formData.businessName || "Your Business"}
                </h3>
                <p className="text-sm text-purple-700 mb-2">
                  {formData.address || "Address not set"}
                </p>
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <Globe className="w-3 h-3" />
                  <span>{formData.timeZone.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-600 mt-1">
                  <Mail className="w-3 h-3" />
                  <span>{formData.contactEmail || "Not set"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
