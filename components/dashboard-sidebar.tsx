"use client"
import {
  BarChart3,
  Users,
  Video,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Home,
  FileText,
  Bell,
  X,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  onLogout: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

const navigation = [
  {
    name: "Dashboard",
    href: "dashboard",
    icon: Home,
    current: true,
  },
  {
    name: "Educators",
    href: "educators",
    icon: Users,
    current: false,
  },
  {
    name: "Add Video",
    href: "add-video",
    icon: Plus,
    current: false,
  },
  {
    name: "Analytics",
    href: "analytics",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Videos",
    href: "videos",
    icon: Video,
    current: false,
  },
  {
    name: "Reports",
    href: "reports",
    icon: FileText,
    current: false,
  },
]

const secondaryNavigation = [
  {
    name: "Notifications",
    href: "notifications",
    icon: Bell,
  },
  {
    name: "Settings",
    href: "settings",
    icon: Settings,
  },
  {
    name: "Help & Support",
    href: "help",
    icon: HelpCircle,
  },
]

export default function DashboardSidebar({
  currentPage,
  onPageChange,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex h-20 items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Image src="/unacademy-logo.png" alt="Unacademy" width={140} height={45} className="h-12 w-auto" priority />
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={isMobile ? onClose : onToggleCollapse} className="h-8 w-8 p-0">
          {isMobile ? (
            <X className="h-4 w-4" />
          ) : (
            <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          )}
        </Button>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold">
                UA
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Unacademy Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@unacademy.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = currentPage === item.href
            const Icon = item.icon

            return (
              <button
                key={item.name}
                onClick={() => onPageChange(item.href)}
                className={`
                  group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                  ${isCollapsed ? "justify-center" : "justify-start"}
                `}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && <span className="flex-1 text-left">{item.name}</span>}
              </button>
            )
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {!isCollapsed && <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</p>}
          {secondaryNavigation.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.name}
                onClick={() => onPageChange(item.href)}
                className={`
                  group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200
                  hover:bg-gray-100 hover:text-gray-900
                  ${isCollapsed ? "justify-center" : "justify-start"}
                `}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && <span className="flex-1 text-left">{item.name}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          onClick={onLogout}
          className={`w-full text-gray-700 hover:bg-red-50 hover:text-red-700 ${isCollapsed ? "px-2" : "justify-start"}`}
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && "Sign out"}
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />}

        {/* Mobile sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          {sidebarContent}
        </div>
      </>
    )
  }

  return (
    <div
      className={`
      hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 bg-white border-r border-gray-200 shadow-sm
      transition-all duration-300 ease-in-out
      ${isCollapsed ? "lg:w-16" : "lg:w-64"}
    `}
    >
      {sidebarContent}
    </div>
  )
}
