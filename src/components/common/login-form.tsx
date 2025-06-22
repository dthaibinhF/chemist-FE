import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useForm} from "react-hook-form";
import {z} from 'zod';
import {zodResolver} from "@hookform/resolvers/zod"
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/feature/auth/hooks/useAuth.ts";
import {toast} from "sonner";

const formSchema = z.object({
    email: z.string().nonempty("Username is required"),
    password: z.string().nonempty("Password is required"),
})

type Credential = z.infer<typeof formSchema>;

const LoginForm = () => {
    const {login} = useAuth();
    // const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const form = useForm<Credential>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "dthaibinh03@gmail.com",
            password: "Dthaibinh@1234",
        }
    });


    const submit = async (value: Credential) => {
        try {
            toast.loading(
                "Logging in..."
                ,
                {
                    id: "loading-toast", // Unique ID to update the toast
                    duration: Infinity, // Keep open until updated
                    className: "bg-blue-500 text-white border-blue-600",
                }
            )
            await login({email: value.email, password: value.password});
            toast.success("Login successful", {
                id: "loading-toast", // Update the same toast
                duration: 2000, // Auto-close after 2 seconds
            })
            navigate("/dashboard");
        } catch {
            toast.error("Email or Password is incorrect", {
                id: "loading-toast",
                duration: 2000,
            })


        }
    }

    return (
        <>
            <Card className="w-full max-w-sm">
                <CardHeader className=" justify-center items-center ">
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your username below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(submit)}>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem className={'mb-3'}>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem className={'mb-3'}>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type={'password'} placeholder="" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                </CardFooter>
            </Card>
        </>
    )
}

export default LoginForm