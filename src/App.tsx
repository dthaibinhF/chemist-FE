import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from '@/context/theme-provider.tsx';
import { router } from '@/router/route.tsx';

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
