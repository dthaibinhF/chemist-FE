import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {ModeToggle} from "@/components/common/mode-toggle.tsx";
import LogOutButton from "@/components/common/logout-button.tsx";

const SiteHeader = () => {
    return (
        <header className="flex flex-row w-full bg-background sticky top-0 h-14 shrink-0 items-center gap-2 border-b px-4">
            <div className={'flex justify-start w-full' }>
                <SidebarTrigger className={'ml-1'}/>
            </div>
            <div className={'flex flex-row justify-end w-full gap-2' }>
                <ModeToggle/>
                <LogOutButton/>
            </div>
        </header>
    )
}

export default SiteHeader;