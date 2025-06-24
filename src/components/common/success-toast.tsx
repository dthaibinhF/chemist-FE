import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface ShowSuccessToastOptions {
    title?: string;
    message?: string;
    duration?: number;
}

export const showSuccessToast = (options: ShowSuccessToastOptions = {}) => {
    const {
        title = "Thành công",
        message = "Thao tác đã được thực hiện thành công",
        duration = 3000
    } = options;

    toast.success(title, {
        description: message,
        duration,
        icon: <CheckCircle className="h-4 w-4" />,
    });
};

export const showErrorToast = (options: ShowSuccessToastOptions = {}) => {
    const {
        title = "Lỗi",
        message = "Đã xảy ra lỗi khi thực hiện thao tác",
        duration = 5000
    } = options;

    toast.error(title, {
        description: message,
        duration,
    });
}; 