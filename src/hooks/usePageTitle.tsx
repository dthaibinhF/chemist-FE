import {useEffect} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {TestTubeDiagonal} from "lucide-react";

export const usePageTitle = (title:string) => {
    useEffect(() => {
        document.title = `${title}`; // Set the title

        // Render FlaskConical to SVG string
        const svgString = renderToStaticMarkup(<TestTubeDiagonal color={'#fff'} size={32}/>);
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