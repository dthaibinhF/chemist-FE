import {Button} from "@/components/ui/button.tsx";
import {useAuth} from "@/feature/auth/hooks/useAuth.ts";

const LogOutButton = () => {
    const {logout} = useAuth();

    return (
        <Button variant={'ghost'} type={'button'} onClick={() => logout()}>Logout</Button>
    )
}

export default LogOutButton;