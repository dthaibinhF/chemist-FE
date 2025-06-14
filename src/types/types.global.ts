export type ApiResponse<T> = {
    payload?: T;
    error?: string;
    message?: string;
    status: number;
}