import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthInit } from '@/features/auth/hooks/useAuthInit';

function App() {
  useAuthInit();
  return <RouterProvider router={router} />;
}

export default App;
