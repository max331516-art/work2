import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { HardHat, Truck, UserCircle, ChevronDown } from "lucide-react";

export type Role = "foreman" | "supplier" | "driver";

interface RoleSwitcherProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const getIcon = (role: Role) => {
    switch (role) {
      case "foreman": return <HardHat className="h-4 w-4 mr-2" />;
      case "supplier": return <UserCircle className="h-4 w-4 mr-2" />;
      case "driver": return <Truck className="h-4 w-4 mr-2" />;
    }
  };

  const getLabel = (role: Role) => {
    switch (role) {
      case "foreman": return "FOREMAN";
      case "supplier": return "SUPPLIER";
      case "driver": return "DRIVER";
    }
  };

  return (
    <div className="bg-secondary text-secondary-foreground p-4 shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h1 className="text-lg font-bold font-display tracking-wider">SNAB<span className="text-primary">ZHENIE</span></h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-border/20 bg-secondary/50 hover:bg-secondary/80 text-white font-display text-xs">
              {getIcon(currentRole)}
              {getLabel(currentRole)}
              <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 font-display">
            <DropdownMenuItem onClick={() => onRoleChange("foreman")} className="cursor-pointer">
              <HardHat className="h-4 w-4 mr-2" /> Foreman
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange("supplier")} className="cursor-pointer">
              <UserCircle className="h-4 w-4 mr-2" /> Supplier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange("driver")} className="cursor-pointer">
              <Truck className="h-4 w-4 mr-2" /> Driver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
