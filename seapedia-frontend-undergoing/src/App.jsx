import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DemoDisclaimerModal from './components/layout/DemoDisclaimerModal';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
        <DemoDisclaimerModal />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
