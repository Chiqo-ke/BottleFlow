"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/icons";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Home,
  ShoppingBag,
  Package,
  Wrench,
  DollarSign,
  LogOut,
  Settings,
  Users,
  History,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

type Role = "admin" | "manager";

const navItems: Record<Role, { href: string; icon: React.ElementType; label: string }[]> = {
  admin: [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/workers", icon: Users, label: "Workers" },
    { href: "/dashboard/stock", icon: Package, label: "Stock" },
    { href: "/dashboard/products", icon: Settings, label: "Products" },
    { href: "/dashboard/salaries", icon: DollarSign, label: "Salaries" },
    { href: "/dashboard/expenses", icon: TrendingUp, label: "Expenses" },
    { href: "/dashboard/audit", icon: History, label: "Audit Trail" },
  ],
  manager: [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/purchases", icon: ShoppingBag, label: "Purchases" },
    { href: "/dashboard/tasks", icon: Wrench, label: "Worker Tasks" },
    { href: "/dashboard/stock", icon: Package, label: "Stock" },
    { href: "/dashboard/salary-payments", icon: DollarSign, label: "Salary Payments" },
  ],
};

function getIsActive(pathname: string, itemHref: string) {
    if (itemHref === '/dashboard') {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
}

function getCurrentPage(pathname: string, role: Role) {
    const items = navItems[role];
    const activeItem = [...items].sort((a,b) => b.href.length - a.href.length).find(item => getIsActive(pathname, item.href));
    return activeItem?.label || 'Dashboard';
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as Role | null;
    if (!role) {
      router.replace("/login");
    } else {
      setUserRole(role);
    }
    setIsClient(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  if (!isClient || !userRole) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentNavItems = navItems[userRole];
  const currentPage = getCurrentPage(pathname, userRole);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 p-2">
              <AppLogo />
              <h1 className="font-headline text-xl font-semibold text-primary">BottleFlow</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {currentNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={getIsActive(pathname, item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t">
              <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="font-headline text-lg font-semibold md:text-xl">
              {currentPage}
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarImage src="https://picsum.photos/seed/user-avatar/100/100" data-ai-hint="person portrait" alt="User avatar" />
                    <AvatarFallback>{userRole.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none capitalize">{userRole}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userRole}@bottleflow.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
