import {useAppSelector} from "@/redux/hook.ts";

const UserItem = () => {
    const {account} = useAppSelector(store => store.auth)

    return (
        <div className="flex flex-col justify-start border rounded-[24px] py-3 px-4">
            <p className={'font-bold'}>{account?.fullName}</p>
            <p>{account?.role?.name.slice(5).toLowerCase()}</p>
        </div>
    )
}

export default UserItem;