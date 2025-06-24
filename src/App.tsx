import { RouterProvider } from "react-router-dom";
import { router } from "@/router/route.tsx";
import { ThemeProvider } from "@/context/theme-provider.tsx";

const  App = () => {
  return (
  <ThemeProvider defaultTheme={"dark"} storageKey={"vite-ui-theme"}>
    <RouterProvider router={router} />
  </ThemeProvider>
  )
}

export default App
