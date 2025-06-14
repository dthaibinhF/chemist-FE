import {RouterProvider} from "react-router-dom";
import {router} from "@/router/route.ts";
import {ThemeProvider} from "@/context/theme-provider.tsx";

function App() {

  return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <RouterProvider router={router}></RouterProvider>
      </ThemeProvider>
  )
}

export default App
