import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

import UserItem from "@/components/common/user-item.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";
import { useRolePermissions } from "@/hooks/useRolePermissions";

const items = {
  navMain: [
    {
      title: "Quản lý",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "dashboard",
          isActive: false,
        },
        {
          title: "Học sinh",
          url: "/student",
          isActive: false,
        },
        {
          title: "Tài chính",
          url: "/finance",
          isActive: false,
        },
        {
          title: "Nhóm học",
          url: "/group",
          isActive: false,
        },
        {
          title: "Học phí",
          url: "/fee",
          isActive: false,
        },
        {
          title: "AI Assistant",
          url: "/ai-assistant",
          isActive: false,
        },
        {
          title: "Lịch học",
          url: "/time-table",
          isActive: false,
        },
        {
          title: "Profile",
          url: "/profile",
          isActive: false,
        },
      ],
    },
    {
      title: "Quản trị hệ thống",
      url: "#",
      items: [
        {
          title: "Quản lý người dùng",
          url: "/admin/users",
          isActive: false,
        },
      ],
    },
  ],
};

const AppSideBar = () => {
  const [render, setRender] = useState<number>(1);
  const {
    student,
    financial,
    group: groupPermissions,
    timetable,
    admin,
    isAuthenticated
  } = useRolePermissions();

  const filteredItems = useMemo(() => {
    if (!isAuthenticated) {
      return { navMain: [] };
    }

    return {
      navMain: items.navMain.map(navGroup => ({
        ...navGroup,
        items: navGroup.items.filter(item => {
          switch (item.url) {
            case '/student':
              // Route requires: ADMIN, MANAGER, TEACHER
              return student.canViewAllStudents || student.canViewOwnStudentData;
            case '/finance':
              // Route requires: ADMIN, MANAGER only
              return financial.canViewAllFinances;
            case '/group':
              // Route requires: ADMIN, MANAGER, TEACHER  
              return groupPermissions.canViewGroups || groupPermissions.canViewOwnGroups;
            case '/fee':
              // Route requires: ADMIN, MANAGER, TEACHER
              return financial.canManageFees || financial.canViewAllFinances;
            case '/admin/users':
              // Route requires: ADMIN only
              return admin.canManageUsers;
            case 'dashboard':
            case '/ai-assistant':
            case '/time-table':
            case '/profile':
              return true;
            default:
              return true;
          }
        })
      })).filter(navGroup => navGroup.items.length > 0)
    };
  }, [student, financial, groupPermissions, timetable, admin, isAuthenticated]);

  function handleClick(item: { url: string; isActive: boolean }) {
    filteredItems.navMain.map((listObj) =>
      listObj.items.map((itemObj) => {
        if (itemObj.url === item.url) {
          itemObj.isActive = true;
        } else itemObj.isActive = false;
      })
    );
    setRender(render + 1);
  }

  useEffect(() => { }, [render]);

  const setActive = (item: {
    title: string;
    url: string;
    isActive: boolean;
  }): boolean | undefined => {
    return item.isActive;
  };
  return (
    // sidebar for the whole app
    <Sidebar className="">
      <SidebarHeader className="my-2">
        <UserItem />
      </SidebarHeader>
      <SidebarContent>
        {filteredItems.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      onClick={() => handleClick(item)}
                      isActive={setActive(item)}
                      className="text-primary hover:text-secondary-foreground"
                    >
                      <Link to={`${item.url}`}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSideBar;
