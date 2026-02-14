
import { useState } from "react";
import { Mail, Loader2, CheckCircle2, XCircle, Send, ExternalLink } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Badge } from "@/react-app/components/ui/badge";

interface CommunicationStepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

type ConnectionStatus = "idle" | "connecting" | "connected" | "failed";

export default function CommunicationStep({ data, onNext, onBack }: CommunicationStepProps) {
  const [emailStatus, setEmailStatus] = useState<ConnectionStatus>(data.emailStatus || "idle");
  const [smtpUser, setSmtpUser] = useState(data.email?.smtpUser || "");
  const [smtpPassword, setSmtpPassword] = useState(data.email?.smtpPassword || "");
  const [fromEmail, setFromEmail] = useState(data.email?.fromEmail || "");
  const [fromName, setFromName] = useState(data.email?.fromName || "");

  const [testingEmail, setTestingEmail] = useState(false);

  const handleConnectEmail = async () => {
    setEmailStatus("connecting");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setEmailStatus("connected");
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTestingEmail(false);
  };

  const handleRetryEmail = () => {
    setEmailStatus("idle");
  };

  const handleNext = () => {
    onNext({
      emailStatus,
      // Nested Payload for Backend
      email: {
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpUser,
        smtpPassword,
        fromEmail: fromEmail || smtpUser,
        fromName,
      },
    });
  };

  const canProceed = emailStatus === "connected";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-purple-950">Communication Setup</h2>
        <p className="text-purple-700 mt-2">Connect your Gmail account to communicate with customers</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Email Provider */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-purple-950">Email Service (Gmail SMTP)</CardTitle>
                  <CardDescription>Connect via Gmail App Password</CardDescription>
                </div>
              </div>
              <StatusBadge status={emailStatus} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailStatus === "idle" && (
              <>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Gmail App Password Required</p>
                      <p>You'll need to generate an App Password from your Google Account.
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-1 inline-flex items-center gap-1"
                        >
                          Get App Password <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpUser" className="text-purple-900">Gmail Address</Label>
                  <Input
                    id="smtpUser"
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="bg-white border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smtpPassword" className="text-purple-900">Gmail App Password</Label>
                    <a
                      href="https://support.google.com/accounts/answer/185833"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      How to get? <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <Input
                    id="smtpPassword"
                    type="password"
                    placeholder="16-character app password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    className="bg-white border-purple-200"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    This is NOT your regular Gmail password. Generate an App Password from Google Account settings.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromEmail" className="text-purple-900">From Email (Optional)</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    placeholder="Same as Gmail address if left blank"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="bg-white border-purple-200"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Leave blank to use your Gmail address
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromName" className="text-purple-900">From Name</Label>
                  <Input
                    id="fromName"
                    placeholder="Your Business Name"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="bg-white border-purple-200"
                  />
                </div>

                <Button
                  onClick={handleConnectEmail}
                  disabled={!smtpUser || !smtpPassword || !fromName}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  Connect Gmail SMTP
                </Button>
              </>
            )}

            {emailStatus === "connecting" && (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-purple-700">Connecting to Gmail SMTP...</p>
              </div>
            )}

            {emailStatus === "connected" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Successfully connected</span>
                  </div>
                  <p className="text-sm text-green-700">Connected to Gmail SMTP</p>
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
