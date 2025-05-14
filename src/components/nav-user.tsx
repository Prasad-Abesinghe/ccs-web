"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { useTheme } from "~/components/theme-provider"
import { useAuth } from "~/contexts/auth-context"
import { signOut } from "next-auth/react"
import { useState } from "react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isPendingLogout, setIsPendingLogout] = useState(false)

  const logout = async () => {
    setIsPendingLogout(true)
    try {
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      console.error("Error signing out:", error)
      setIsPendingLogout(false)
    }
  }

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
              {!isMobile && (
                <>
                  <div className="ml-3 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{user.name ?? 'User'}</div>
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.email ?? ''}
                    </div>
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name ?? 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email ?? ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => logout()}
              disabled={isPendingLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isPendingLogout ? "Logging out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
