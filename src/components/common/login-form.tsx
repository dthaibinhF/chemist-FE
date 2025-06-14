import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useForm} from "react-hook-form";
import {z} from 'zod';
import {zodResolver} from "@hookform/resolvers/zod"
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/feature/auth/hooks/useAuth.ts";

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
            const response = await login({email: value.email, password: value.password});
            console.log('response in login: ', response);
            // const newToken = response.headers.authorization;
            // dispatch(setAccessToken(newToken));
            navigate("/dashboard");
        } catch {
            // dispatch(setAccessToken(null));
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
                                            <Input placeholder="" {...field} />
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