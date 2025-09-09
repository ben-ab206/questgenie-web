'use client';

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import {  Home, Plus, LogOut, X, ChevronLeft, ChevronRight, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    { href: "/dashboard", icon: Home, label: "Dashboard", testId: "nav-dashboard" },
    { href: "/generate", icon: Plus, label: "Generate Questions", testId: "nav-create" },
    { href: "/question-banks", icon: Book, label: "Question Banks", testId: "question-banks" }
  ];

  const handleNavClick = (href: string) => {
    if (!href.startsWith("#")) {
      router.push(href);
      onClose?.();
    }
  };

  const goToProfile = () => {
    router.push('/profile');
  }

  const handleLogout = () => {
    onLogout?.();
  };

  const getInitials = (name: string, email: string) => {
    if (name && name !== "User") {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || (href === "/" && pathname === "/");
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
            <div>
              <Image src={"/icons/quest-genie-icon.png"} height={30} width={30} alt="logo"/>
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
                "flex items-center w-full rounded-lg transition-all duration-300 relative",
                isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3 space-x-3",
                isActiveRoute(href)
                  ? "bg-primary/10" 
                  : "text-gray-600 hover:bg-primary/10 hover:text-gray-800"
              )}
              data-testid={testId}
              title={isCollapsed ? label : undefined}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors duration-200",
                isActiveRoute(href) ? "text-primary" : ""
              )} />
              {!isCollapsed && (
                <span className={cn(
                  "transition-colors duration-200",
                  isActiveRoute(href) ? "text-primary" : ""
                )}>
                  {label}
                </span>
              )}
            </button>
          )
        ))}
      </nav>
      
      <div className="py-5 px-5 border-t border-gray-200">
        <button className={cn(
          "flex items-center mb-3 transition-all duration-300 hover:bg-primary/10 w-full px-2 py-1 rounded-lg",
          isCollapsed ? "justify-center" : "space-x-3"
        )} onClick={goToProfile}>
          <div className="w-10 h-10 border rounded-full flex items-center justify-center bg-gray-50">
            <span className="font-semibold text-sm text-gray-700">
              {getInitials(userName, userEmail)}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-start">
              <p className="font-medium text-sm truncate text-gray-800" data-testid="text-username">
                {userName}
              </p>
            </div>
          )}
        </button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300",
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