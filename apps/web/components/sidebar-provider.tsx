"use client"

import * as React from "react"

type SidebarContextType = {
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = React.useState(true)

  const toggleSidebar = React.useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return <SidebarContext.Provider value={{ expanded, setExpanded, toggleSidebar }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
