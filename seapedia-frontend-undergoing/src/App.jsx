import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DemoDisclaimerModal from './components/layout/DemoDisclaimerModal';
import SessionExpiredModal from './components/layout/SessionExpiredModal';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
        <DemoDisclaimerModal />
        {/* Modal otomatis muncul saat token expired (401) atau role berubah (403) */}
        <SessionExpiredModal />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
