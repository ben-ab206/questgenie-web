'use client';

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { Brain, Home, Plus, List, LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose?: () => void;
  userEmail?: string;
  userName?: string;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export default function Sidebar({ 
  onClose, 
  userEmail = "email@gmail.com",
  userName = "User",
  onLogout,
  isLoggingOut = false
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard", testId: "nav-dashboard" },
    { href: "/create", icon: Plus, label: "Generate Questions", testId: "nav-create" },
    { href: "/quizzes", icon: List, label: "Question Bank", testId: "nav-quizzes" },
  ];

  const handleNavClick = (href: string) => {
    if (!href.startsWith("#")) {
      router.push(href);
      onClose?.();
    }
  };

  const handleLogout = () => {
    onLogout?.();
  };

  const getInitials = (name: string, email: string) => {
    if (name && name !== "User") {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed ? "justify-center w-full" : "space-x-3"
          )}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-poppins font-bold text-xl text-textDark">QuestGenie</span>
            )}
          </div>
          
          {!onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              data-testid="collapse-sidebar-button"
              className="hidden lg:flex"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onClose}
              data-testid="close-sidebar-button"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-5 space-y-2">
        {navItems.map(({ href, icon: Icon, label, testId }) => (
          href.startsWith("#") ? (
            <div
              key={href}
              className={cn(
                "flex items-center rounded-lg font-medium text-gray-400 cursor-not-allowed transition-all duration-300",
                isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3 space-x-3"
              )}
              data-testid={testId}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span>{label}</span>
                  <span className="ml-auto text-xs">Coming Soon</span>
                </>
              )}
            </div>
          ) : (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className={cn(
                "flex items-center w-full rounded-lg font-medium transition-all duration-300",
                isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3 space-x-3",
                pathname === href || (href === "/dashboard" && pathname === "/")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              data-testid={testId}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{label}</span>}
            </button>
          )
        ))}
      </nav>
      
      <div className="p-5 border-t border-gray-200">
        <div className={cn(
          "flex items-center mb-3 transition-all duration-300",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="w-10 h-10 border rounded-full flex items-center justify-center">
            <span className="font-semibold text-sm">
              {getInitials(userName, userEmail)}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" data-testid="text-username">
                {userName}
              </p>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "text-gray-600 hover:text-gray-900 transition-all duration-300",
            isCollapsed ? "w-10 h-10 p-0" : "w-full justify-start"
          )}
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-testid="button-logout"
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && (
            <span className="ml-2">
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}