import {Outlet} from "react-router-dom";
import {useEffect} from "react";
import {TestTubeDiagonal} from "lucide-react";
import {renderToStaticMarkup} from "react-dom/server";

const HomeLayout = () => {

    useEffect(() => {
        document.title = 'Chemist'; // Set the title

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

    return <h1>
        Home Layout
        <Outlet/>
    </h1>
}

export default HomeLayout;