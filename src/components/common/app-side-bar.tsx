import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import UserItem from '@/components/common/user-item.tsx';
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
} from '@/components/ui/sidebar.tsx';

const items = {
  navMain: [
    {
      title: 'Quản lý',
      url: '#',
      items: [
        {
          title: 'Dashboard',
          url: 'dashboard',
          isActive: false,
        },
        {
          title: 'Học sinh',
          url: '/student',
          isActive: false,
        },
        {
          title: 'Tài chính',
          url: '/finance',
          isActive: false,
        },
        {
          title: 'Nhóm học',
          url: '/group',
          isActive: false,
        },
      ],
    },
  ],
};

const AppSideBar = () => {
  const [render, setRender] = useState<number>(1);

  function handleClick(item: { url: string; isActive: boolean }) {
    items.navMain.map((listObj) =>
      listObj.items.map((itemObj) => {
        if (itemObj.url === item.url) {
          itemObj.isActive = true;
        } else itemObj.isActive = false;
      })
    );
    setRender(render + 1);
  }

  useEffect(() => {}, [render]);

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
        {/* We create a SidebarGroup for each parent. */}
        {items.navMain.map((item) => (
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
