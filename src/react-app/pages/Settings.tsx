import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Badge } from "@/react-app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Label } from "@/react-app/components/ui/label";
import { Building, Mail, Save, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { api } from "@/react-app/lib/api";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // General State
  const [generalData, setGeneralData] = useState({
    businessName: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    timezone: ""
  });

  // Integrations State
  const [integrationsStatus, setIntegrationsStatus] = useState<any>(null);
  const [emailConfig, setEmailConfig] = useState({ smtpUser: "", smtpPassword: "", fromEmail: "", fromName: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [onboardingStatus, integrations] = await Promise.all([
        api.getOnboardingStatus(),
        api.getIntegrations()
      ]);

      if (onboardingStatus?.workspace) {
        setGeneralData({
          businessName: onboardingStatus.workspace.businessName || "",
          address: onboardingStatus.workspace.address || "",
          contactEmail: onboardingStatus.workspace.contactEmail || "",
          contactPhone: onboardingStatus.workspace.contactPhone || "",
          timezone: onboardingStatus.workspace.timezone || ""
        });
      }
      setIntegrationsStatus(integrations);
      if (integrations?.email) {
        setEmailConfig({
          smtpUser: integrations.email.smtpUser || "",
          smtpPassword: integrations.email.smtpPassword || "",
          fromEmail: integrations.email.fromEmail || "",
          fromName: integrations.email.fromName || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.completeOnboardingStep(1, generalData);
      toast.success("Business details updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(`Failed to update details: ${(error as any).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleIntegrationSave = async () => {
    setSaving(true);
    try {
      const payload: any = { email: emailConfig };

      await api.completeOnboardingStep(2, payload);
      await fetchSettings(); // Refresh status
      toast.success("Email integration connected!");

    } catch (error) {
      console.error(error);
      toast.error("Failed to connect integration. Check your credentials.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-purple-950">Settings</h1>
        <p className="text-purple-700 mt-1">Manage your business profile and third-party integrations.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-purple-50 p-1">
          <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
            <Building className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
            <Save className="w-4 h-4 mr-2" /> Integrations
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Update your public facing business details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneralSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input
                      value={generalData.businessName}
                      onChange={(e) => setGeneralData({ ...generalData, businessName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input
                      value={generalData.timezone}
                      onChange={(e) => setGeneralData({ ...generalData, timezone: e.target.value })}
                      placeholder="e.g. America/New_York"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={generalData.address}
                      onChange={(e) => setGeneralData({ ...generalData, address: e.target.value })}
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={generalData.contactEmail}
                      onChange={(e) => setGeneralData({ ...generalData, contactEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input
                      value={generalData.contactPhone}
                      onChange={(e) => setGeneralData({ ...generalData, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-purple-600">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="mt-6 space-y-6">

          {/* Email Integration */}
          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Email Service (Gmail SMTP)</CardTitle>
                  <CardDescription>Transactional emails via Gmail</CardDescription>
                </div>
              </div>
              {integrationsStatus?.email?.isConfigured ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500 border-gray-300">
                  Not Configured
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Gmail SMTP Configuration</Label>
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Get App Password <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-100 mb-2">
                    <strong>Gmail App Password Required:</strong> Generate an App Password from your Google Account settings. This is NOT your regular Gmail password.
                    <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">Learn how</a>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gmail Address</Label>
                  <Input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={emailConfig.smtpUser}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gmail App Password</Label>
                  <Input
                    placeholder="16-character app password"
                    type="password"
                    value={emailConfig.smtpPassword}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Generate from Google Account settings, not your regular password</p>
                </div>
                <div className="space-y-2">
                  <Label>From Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="Leave blank to use Gmail address"
                    value={emailConfig.fromEmail}
                    onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sender Name</Label>
                  <Input
                    placeholder="My Business Info"
                    value={emailConfig.fromName}
                    onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => handleIntegrationSave()}
                    disabled={saving || !emailConfig.smtpUser || !emailConfig.smtpPassword}
                    className="w-full"
                  >
                    {saving ? "Connecting..." : "Connect Gmail SMTP"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}
