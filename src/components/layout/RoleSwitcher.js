"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RoleSwitcher({ currentRole }) {
  const router = useRouter();

  const handleRoleChange = (role) => {
    // In a real app, this would re-authenticate. For the demo, we just route to the base path.
    if (role === "employee") router.push("/employee/goals");
    if (role === "manager") router.push("/manager/dashboard");
    if (role === "admin") router.push("/admin/dashboard");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Demo Role:</span>
      <Select defaultValue={currentRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="employee">Employee</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
