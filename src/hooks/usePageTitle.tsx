import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TestTubeDiagonal } from "lucide-react";
import { useLocation } from "react-router-dom";

export const usePageTitle = (title: string) => {
    useEffect(() => {
        document.title = `${title}`; // Set the title

        // Render FlaskConical to SVG string
        const svgString = renderToStaticMarkup(<TestTubeDiagonal color={'#fff'} size={32} />);
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

        // Remove existing favicon
        const existingLink = document.querySelector("link[rel*='icon']");
        if (existingLink) {
            existingLink.remove();
        }

        // Create new favicon link
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = dataUrl;
        document.head.appendChild(link);
    }, [])
}

// Hook để lấy tiêu đề trang dựa trên route hiện tại
export const useCurrentPageTitle = () => {
    const location = useLocation();
    console.log("location", location.pathname);
    const getPageTitle = (pathname: string) => {
        switch (pathname) {
            case '/':
            case '/dashboard':
                return 'Dashboard';
            case '/student':
                return 'Quản lý học sinh';
            case '/finance':
                return 'Quản lý tài chính';
            case '/group':
                return 'Quản lý nhóm học';
            case '/login':
                return 'Đăng nhập';
            case '/student/:id':
                return 'Chi tiết học sinh';
            default:
                return 'Trang chủ';
        }
    };

    return getPageTitle(location.pathname);
};