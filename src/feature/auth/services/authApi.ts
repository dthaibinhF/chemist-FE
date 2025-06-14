import {createApiClient} from "@/service/api-client.ts";
import {TCredentials} from "@/feature/auth/types/auth.type.ts";

const apiClient = createApiClient('auth', {auth:false});

export const loginWithEmailAndPassword = async (credential: TCredentials) => {
    try {
        console.log("loginWithEmailAndPassword", credential);
        const response = await apiClient.post('/login', {
            email: credential.email,
            password: credential.password,
        });
        console.log('loginWithEmailAndPassword', response);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

