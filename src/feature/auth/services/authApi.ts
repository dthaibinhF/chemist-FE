import {createApiClient} from "@/service/api-client.ts";
import {TCredentials} from "@/feature/auth/types/auth.type.ts";

const apiClient = createApiClient('auth', {auth:false});

export const loginWithEmailAndPassword = async (credential: TCredentials) => {
    try {
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

export const getAccount = async () => {
    const apiFetchUser = createApiClient('auth');

    try {
        const response = await apiFetchUser.get('/me');
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
