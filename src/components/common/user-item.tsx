import {useAppSelector} from "@/redux/hook.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

const UserItem = () => {
    const {account, isLoading} = useAppSelector(store => store.auth)

    if (isLoading || !account) {
        return (
            <div className="flex flex-col justify-start border rounded-[24px] py-3 px-4">
                <Skeleton className={'h-3 mb-2'}/>
                <Skeleton className={'h-3 mb-2'}/>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-start border rounded-[24px] py-3 px-4">
            <p className={'font-bold'}>{account?.name}</p>
            <p>{account?.role?.name.slice(5).toLowerCase()}</p>
        </div>
    )
}

export default UserItem;