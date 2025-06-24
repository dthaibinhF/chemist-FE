import { useState, useEffect, useCallback, useRef } from "react";

interface UseLoaderOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    autoLoad?: boolean;
    dependencies?: any[];
}

interface UseLoaderReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    load: () => Promise<void>;
    reload: () => Promise<void>;
    setData: (data: T) => void;
    clearError: () => void;
}

export function useLoader<T>(
    loader: () => Promise<T>,
    options: UseLoaderOptions<T> = {}
): UseLoaderReturn<T> {
    const {
        onSuccess,
        onError,
        autoLoad = true,
        dependencies = []
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Use refs to store stable references
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    // Update refs when props change
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await loader();
            setData(result);
            onSuccessRef.current?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error occurred');
            setError(error);
            onErrorRef.current?.(error);
        } finally {
            setLoading(false);
        }
    }, [loader]);

    const reload = useCallback(async () => {
        await load();
    }, [load]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto load when dependencies change
    useEffect(() => {
        if (autoLoad) {
            load();
        }
    }, [autoLoad, load, ...dependencies]);

    return {
        data,
        loading,
        error,
        load,
        reload,
        setData,
        clearError
    };
} 