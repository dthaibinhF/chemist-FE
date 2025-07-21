import LogOutButton from "@/components/common/logout-button.tsx";
import { ModeToggle } from "@/components/common/mode-toggle.tsx";
import { SidebarTrigger } from "@/components/ui/sidebar.tsx";
import { useCurrentPageTitle } from "@/hooks/usePageTitle.tsx";

const SiteHeader = () => {
  const pageTitle = useCurrentPageTitle();

  return (
    <header className="flex flex-row w-full z-20 bg-background sticky top-0 h-14 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex justify-start w-full items-center gap-4">
        <SidebarTrigger className="ml-1" />
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>
      <div className="flex flex-row justify-end w-full gap-2">
        <ModeToggle />
        <LogOutButton />
      </div>
    </header>
  );
};

export default SiteHeader;
