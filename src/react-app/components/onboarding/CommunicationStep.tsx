import { useState } from "react";
import { Mail, MessageSquare, CheckCircle2, XCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Badge } from "@/react-app/components/ui/badge";

interface CommunicationStepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack: () => void;
}

type ConnectionStatus = "idle" | "connecting" | "connected" | "failed";

export default function CommunicationStep({ data, onNext, onBack }: CommunicationStepProps) {
  const [emailStatus, setEmailStatus] = useState<ConnectionStatus>(data.emailStatus || "idle");
  const [smsStatus, setSmsStatus] = useState<ConnectionStatus>(data.smsStatus || "idle");
  const [emailProvider, setEmailProvider] = useState(data.emailProvider || "");
  const [emailApiKey, setEmailApiKey] = useState(data.emailApiKey || "");
  const [smsProvider, setSmsProvider] = useState(data.smsProvider || "");
  const [smsApiKey, setSmsApiKey] = useState(data.smsApiKey || "");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSms, setTestingSms] = useState(false);

  const handleConnectEmail = async () => {
    setEmailStatus("connecting");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setEmailStatus("connected");
  };

  const handleConnectSms = async () => {
    setSmsStatus("connecting");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSmsStatus("connected");
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTestingEmail(false);
  };

  const handleTestSms = async () => {
    setTestingSms(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTestingSms(false);
  };

  const handleRetryEmail = () => {
    setEmailStatus("idle");
  };

  const handleRetrySms = () => {
    setSmsStatus("idle");
  };

  const handleNext = () => {
    onNext({
      emailStatus,
      smsStatus,
      emailProvider,
      emailApiKey,
      smsProvider,
      smsApiKey,
    });
  };

  const canProceed = emailStatus === "connected" && smsStatus === "connected";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-purple-950">Communication Setup</h2>
        <p className="text-purple-700 mt-2">Connect your email and SMS providers to communicate with customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Provider */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-purple-950">Email Provider</CardTitle>
                  <CardDescription>Connect your email service</CardDescription>
                </div>
              </div>
              <StatusBadge status={emailStatus} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailStatus === "idle" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="emailProvider" className="text-purple-900">Provider</Label>
                  <Input
                    id="emailProvider"
                    placeholder="e.g., SendGrid, Mailgun, AWS SES"
                    value={emailProvider}
                    onChange={(e) => setEmailProvider(e.target.value)}
                    className="bg-white border-purple-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailApiKey" className="text-purple-900">API Key</Label>
                  <Input
                    id="emailApiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={emailApiKey}
                    onChange={(e) => setEmailApiKey(e.target.value)}
                    className="bg-white border-purple-200"
                  />
                </div>
                <Button
                  onClick={handleConnectEmail}
                  disabled={!emailProvider || !emailApiKey}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  Connect Email
                </Button>
              </>
            )}

            {emailStatus === "connecting" && (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-purple-700">Connecting to {emailProvider}...</p>
              </div>
            )}

            {emailStatus === "connected" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Successfully connected</span>
                  </div>
                  <p className="text-sm text-green-700">Connected to {emailProvider}</p>
                </div>
                <Button
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  variant="outline"
                  className="w-full"
                >
                  {testingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Test...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </div>
            )}

            {emailStatus === "failed" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Connection failed</span>
                  </div>
                  <p className="text-sm text-red-700">Invalid credentials or service unavailable</p>
                </div>
                <Button onClick={handleRetryEmail} variant="outline" className="w-full">
                  Retry Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Provider */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-purple-950">SMS Provider</CardTitle>
                  <CardDescription>Connect your SMS service</CardDescription>
                </div>
              </div>
              <StatusBadge status={smsStatus} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {smsStatus === "idle" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="smsProvider" className="text-purple-900">Provider</Label>
                  <Input
                    id="smsProvider"
                    placeholder="e.g., Twilio, Plivo, AWS SNS"
                    value={smsProvider}
                    onChange={(e) => setSmsProvider(e.target.value)}
                    className="bg-white border-purple-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smsApiKey" className="text-purple-900">API Key</Label>
                  <Input
                    id="smsApiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={smsApiKey}
                    onChange={(e) => setSmsApiKey(e.target.value)}
                    className="bg-white border-purple-200"
                  />
                </div>
                <Button
                  onClick={handleConnectSms}
                  disabled={!smsProvider || !smsApiKey}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600"
                >
                  Connect SMS
                </Button>
              </>
            )}

            {smsStatus === "connecting" && (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-purple-700">Connecting to {smsProvider}...</p>
              </div>
            )}

            {smsStatus === "connected" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Successfully connected</span>
                  </div>
                  <p className="text-sm text-green-700">Connected to {smsProvider}</p>
                </div>
                <Button
                  onClick={handleTestSms}
                  disabled={testingSms}
                  variant="outline"
                  className="w-full"
                >
                  {testingSms ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Test...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test SMS
                    </>
                  )}
                </Button>
              </div>
            )}

            {smsStatus === "failed" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Connection failed</span>
                  </div>
                  <p className="text-sm text-red-700">Invalid credentials or service unavailable</p>
                </div>
                <Button onClick={handleRetrySms} variant="outline" className="w-full">
                  Retry Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  switch (status) {
    case "connecting":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Connecting</Badge>;
    case "connected":
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Connected</Badge>;
    case "failed":
      return <Badge variant="secondary" className="bg-red-100 text-red-700">Failed</Badge>;
    default:
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Not connected</Badge>;
  }
}
