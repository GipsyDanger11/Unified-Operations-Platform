
import { useState } from "react";
import { User, Mail, Shield } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import { Switch } from "@/react-app/components/ui/switch";

interface StaffStepProps {
    data: Record<string, any>;
    onNext: (data: Record<string, any>) => void;
    onBack: () => void;
    isFirstStep?: boolean;
    isLastStep?: boolean;
    title?: string;
}

export default function StaffStep({ data, onNext, onBack, title }: StaffStepProps) {
    const [firstName, setFirstName] = useState(data.staffFirstName || "");
    const [lastName, setLastName] = useState(data.staffLastName || "");
    const [email, setEmail] = useState(data.staffEmail || "");
    const [role, setRole] = useState(data.staffRole || "staff");

    // Permissions
    const [permBookings, setPermBookings] = useState(true);
    const [permInventory, setPermInventory] = useState(false);
    const [permInbox, setPermInbox] = useState(true);

    const handleNext = () => {
        onNext({
            staffFirstName: firstName,
            staffLastName: lastName,
            staffEmail: email,
            staffRole: role,
            staffPermissions: {
                bookings: permBookings,
                inventory: permInventory,
                inbox: permInbox,
            }
        });
    };

    const handleSkip = () => {
        onNext({}); // Skip sending data, just proceed
    };

    const isValid = firstName && lastName && email;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-purple-950">{title || "Team Setup"}</h2>
                <p className="text-purple-700 mt-2">Invite team members to help manage your operations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-purple-950">Add Team Member</CardTitle>
                            <CardDescription>Send an invitation to a colleague</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-purple-900">First Name</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Jane"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="bg-white border-purple-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-purple-900">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="bg-white border-purple-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-purple-900">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jane@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-white border-purple-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-purple-900">Role</Label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3 w-4 h-4 text-purple-500 z-10" />
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger id="role" className="pl-10 bg-white border-purple-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="staff">Staff (Limited Access)</SelectItem>
                                            <SelectItem value="manager">Manager (Full Access excluding Billing)</SelectItem>
                                            <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {role !== 'admin' && (
                        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                            <CardHeader>
                                <CardTitle className="text-sm text-purple-900">Permissions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="perm-bookings" className="flex flex-col cursor-pointer">
                                        <span>Manage Bookings</span>
                                        <span className="font-normal text-xs text-muted-foreground">View and modify schedule</span>
                                    </Label>
                                    <Switch id="perm-bookings" checked={permBookings} onCheckedChange={setPermBookings} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="perm-inbox" className="flex flex-col cursor-pointer">
                                        <span>Access Inbox</span>
                                        <span className="font-normal text-xs text-muted-foreground">Read and reply to messages</span>
                                    </Label>
                                    <Switch id="perm-inbox" checked={permInbox} onCheckedChange={setPermInbox} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="perm-inventory" className="flex flex-col cursor-pointer">
                                        <span>Manage Inventory</span>
                                        <span className="font-normal text-xs text-muted-foreground">Update stock levels</span>
                                    </Label>
                                    <Switch id="perm-inventory" checked={permInventory} onCheckedChange={setPermInventory} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Tip */}
                <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-purple-600 mt-1" />
                            <div>
                                <h4 className="text-sm font-semibold text-purple-900 mb-1">Team Access</h4>
                                <p className="text-xs text-purple-700">
                                    Invited members will receive an email to set up their password. You can revoke access at any time.
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
                <div className="flex gap-3">
                    <Button onClick={handleSkip} variant="ghost" className="text-purple-600 hover:text-purple-800">
                        Skip for now
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!isValid}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
                    >
                        Send Invitation
                    </Button>
                </div>
            </div>
        </div>
    );
}
