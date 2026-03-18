import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.js";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CrmPage from "./pages/CrmPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import ResultatsOCRPage from "./pages/ResultatsOCRPage.jsx";
import AppLayout from "./components/shared/AppLayout.jsx";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/crm" replace />} />
        <Route path="crm" element={<CrmPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="resultats-ocr" element={<ResultatsOCRPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
