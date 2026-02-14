import { useState, useEffect } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Badge } from "@/react-app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/react-app/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/react-app/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/react-app/components/ui/dialog";
import { Checkbox } from "@/react-app/components/ui/checkbox";
import { Label } from "@/react-app/components/ui/label";
import { Users, Plus, Shield, ShieldAlert, Loader2 } from "lucide-react";
import { api } from "@/react-app/lib/api";

interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'staff';
  permissions?: {
    inbox: boolean;
    bookings: boolean;
    forms: boolean;
    inventory: boolean;
  };
}

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string, name: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  // New Staff Form State
  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    permissions: {
      inbox: true,
      bookings: false,
      forms: false,
      inventory: false
    }
  });

  useEffect(() => {
    checkStatusAndFetch();
  }, []);

  const checkStatusAndFetch = async () => {
    try {
      const status = await api.getOnboardingStatus();
      /* 
         Logic: If onboarding step < 2, business details aren't set.
         If email/sms not configured, they can't invite staff properly via email.
         We'll check if business name exists as a proxy for "setup started".
      */
      if (status?.workspace?.businessName) {
        setIsOnboarded(true);
        try {
          const response = await api.getStaff();
          console.log('Staff API response:', response);
          setStaff(Array.isArray(response.staff) ? response.staff : []);
        } catch (staffError) {
          console.error("Failed to fetch staff:", staffError);
          setStaff([]);
        }
      } else {
        setIsOnboarded(false);
      }
    } catch (error) {
      console.error("Failed to fetch team data:", error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      await api.inviteStaff(newStaff);
      setIsInviteOpen(false);
      setNewStaff({
        firstName: "",
        lastName: "",
        email: "",
        permissions: { inbox: true, bookings: false, forms: false, inventory: false }
      });
      toast.success("Staff invited successfully! Check email for credentials.");
      checkStatusAndFetch();
    } catch (error) {
      console.error(error);
      const errorMessage = (error as any).message || "Failed to invite staff. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleRemoveClick = (userId: string, memberName: string) => {
    setMemberToRemove({ id: userId, name: memberName });
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    setRemoving(true);
    try {
      await api.removeStaff(memberToRemove.id);
      toast.success("Staff member removed successfully");
      checkStatusAndFetch();
    } catch (error) {
      console.error(error);
      const errorMessage = (error as any).message || "Failed to remove staff member";
      toast.error(errorMessage);
    } finally {
      setRemoving(false);
      setMemberToRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Setup Required</h2>
        <p className="text-gray-500 max-w-md">
          Before you can add team members, you need to complete your business profile setup.
        </p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link to="/settings">Go to Settings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-950">Team</h1>
          <p className="text-purple-700 mt-1">Manage staff access and permissions.</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Staff</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={newStaff.firstName}
                    onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={newStaff.lastName}
                    onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="mb-2 block">Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(newStaff.permissions).map((perm) => (
                    <div key={perm} className="flex items-center space-x-2 border p-2 rounded">
                      <Checkbox
                        id={perm}
                        checked={newStaff.permissions[perm as keyof typeof newStaff.permissions]}
                        onCheckedChange={(checked) =>
                          setNewStaff({
                            ...newStaff,
                            permissions: { ...newStaff.permissions, [perm]: !!checked }
                          })
                        }
                      />
                      <label htmlFor={perm} className="capitalize text-sm cursor-pointer select-none">
                        {perm}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleInvite} className="w-full bg-purple-600">
                Send Invite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-950">Staff Members</CardTitle>
          <CardDescription>
            Owner has full access. Staff members have restricted access based on permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove <span className="font-semibold text-purple-900">{memberToRemove?.name}</span>?
                  They will lose access to the workspace immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleConfirmRemove();
                  }}
                  disabled={removing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {removing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Remove Access"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                        {member.firstName?.[0] || '?'}{member.lastName?.[0] || '?'}
                      </div>
                      <div>
                        {member.firstName || 'Unknown'} {member.lastName || 'User'}
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'owner' ? "default" : "secondary"} className="capitalize">
                      {member.role === 'owner' ? <Shield className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.role === 'owner' ? (
                      <span className="text-sm text-gray-500 italic">Full Access</span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {Object.entries(member.permissions || {}).filter(([, v]) => v).map(([k]) => (
                          <Badge key={k} variant="outline" className="text-xs bg-gray-50 capitalize">
                            {k}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveClick(member._id, `${member.firstName || 'Unknown'} ${member.lastName || 'User'}`)}
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
