"use client";

import * as React from "react";
import {
  Users,
  PieChart,
  Rss,
  ScrollText,
  FileUser,
  Layers
} from "lucide-react";
import Image from "next/image";

import { NavMain } from "~/components/nav-main";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

// Custom Logo component to render the PNG image
const LogoImage = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={props.className}>
    <Image
      src="/favicon-96x96.png"
      alt="Logo"
      width={32}
      height={32}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  </div>
);

// This is sample data.
const data = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "BEELIVE",
      logo: LogoImage,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Levels",
      url: "/levels",
      icon: Layers,
      isActive: true,
    },
    // {
    //   title: "Organization",
    //   url: "/organization",
    //   icon: GitBranch,
    // },
    {
      title: "Sensors",
      url: "/sensors",
      icon: Rss,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: PieChart,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
    {
      title: "Roles",
      url: "/roles",
      icon: FileUser,
    },
    {
      title: "Logs",
      url: "/logs",
      icon: ScrollText,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
