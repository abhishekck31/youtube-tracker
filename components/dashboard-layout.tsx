"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardSidebar from "./dashboard-sidebar"
import DashboardHeader from "./dashboard-header"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
  onLogout: () => void
  headerTitle: string
  headerSubtitle?: string
  searchPlaceholder?: string
  onSearch?: (query: string) => void
}

export default function DashboardLayout({
  children,
  currentPage,
  onPageChange,
  onLogout,
  headerTitle,
  headerSubtitle,
  searchPlaceholder,
  onSearch,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleMobileMenuClick = () => {
    setMobileSidebarOpen(true)
  }

  const handleCloseMobileSidebar = () => {
    setMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Sidebar */}
      <DashboardSidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        onLogout={onLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobile={isMobile}
        isOpen={mobileSidebarOpen}
        onClose={handleCloseMobileSidebar}
      />

      {/* Main content */}
      <div
        className={`
        transition-all duration-300 ease-in-out
        ${isMobile ? "lg:ml-0" : sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}
      `}
      >
        {/* Header */}
        <DashboardHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          onMenuClick={handleMobileMenuClick}
          onLogout={onLogout}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
        />

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
