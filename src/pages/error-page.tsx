import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const ErrorPage = () => {
    const error = useRouteError();
    const isRouteError = isRouteErrorResponse(error);

    let errorMessage = "Đã xảy ra lỗi không xác định";
    let errorTitle = "Lỗi";

    if (isRouteError) {
        switch (error.status) {
            case 404:
                errorTitle = "Không tìm thấy";
                errorMessage = "Trang bạn đang tìm kiếm không tồn tại.";
                break;
            case 401:
                errorTitle = "Không có quyền truy cập";
                errorMessage = "Bạn không có quyền truy cập vào trang này.";
                break;
            case 403:
                errorTitle = "Bị cấm truy cập";
                errorMessage = "Bạn bị cấm truy cập vào trang này.";
                break;
            case 500:
                errorTitle = "Lỗi máy chủ";
                errorMessage = "Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.";
                break;
            default:
                errorTitle = `Lỗi ${error.status}`;
                errorMessage = error.data?.message || error.statusText || "Đã xảy ra lỗi";
        }
    } else if (error instanceof Error) {
        errorTitle = "Lỗi";
        errorMessage = error.message;
    }

    const handleRetry = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-xl text-destructive">{errorTitle}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">{errorMessage}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                            onClick={handleRetry} 
                            className="flex-1"
                            variant="outline"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Thử lại
                        </Button>
                        <Button 
                            onClick={handleGoHome} 
                            className="flex-1"
                        >
                            Về trang chủ
                        </Button>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-4 text-left">
                            <summary className="cursor-pointer text-sm text-muted-foreground">
                                Chi tiết lỗi (Development)
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(error, null, 2)}
                            </pre>
                        </details>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}; 