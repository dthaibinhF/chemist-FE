import { cn } from "@/lib/utils";

interface LoadingDotsProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    color?: "gray" | "primary" | "muted";
}

export const LoadingDots = ({
    className,
    size = "md",
    color = "muted"
}: LoadingDotsProps) => {
    const sizeClasses = {
        sm: "w-1 h-1",
        md: "w-1.5 h-1.5",
        lg: "w-2 h-2"
    };

    const colorClasses = {
        gray: "bg-gray-400",
        primary: "bg-primary",
        muted: "bg-muted-foreground"
    };

    const dotClass = cn(
        sizeClasses[size],
        colorClasses[color],
        "rounded-full animate-bounce"
    );

    return (
        <div className={cn("flex space-x-1", className)}>
            <div
                className={dotClass}
                style={{ animationDelay: '0ms' }}
            />
            <div
                className={dotClass}
                style={{ animationDelay: '150ms' }}
            />
            <div
                className={dotClass}
                style={{ animationDelay: '300ms' }}
            />
        </div>
    );
}; 