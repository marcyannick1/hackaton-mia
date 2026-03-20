import {Routes, Route, Navigate} from "react-router-dom";
import {useAuth} from "./hooks/useAuth.js";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ConformitePage from "./pages/ConformitePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AppLayout from "./components/shared/AppLayout.jsx";

function ProtectedRoute({children}) {
    const {user} = useAuth();
    if (!user) return <Navigate to="/login" replace/>;
    return children;
}

function AdminRoute({children}) {
    const {user} = useAuth();
    if (!user) return <Navigate to="/login" replace/>;
    if (user.role !== "admin") return <Navigate to="/conformite" replace/>;
    return children;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/" element={<ProtectedRoute><AppLayout/></ProtectedRoute>}>
                <Route index element={<Navigate to="/conformite" replace/>}/>
                <Route path="conformite" element={<ConformitePage/>}/>
                <Route path="admin" element={<AdminRoute><AdminPage/></AdminRoute>}/>
            </Route>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}
