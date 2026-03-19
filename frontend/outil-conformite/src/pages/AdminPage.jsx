import AdminDashboard from "../components/admin/AdminDashboard.jsx";
export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard admin</h1>
        <p className="text-sm text-slate-500 mt-1">Gerez les documents en attente de validation.</p>
      </div>
      <AdminDashboard />
    </div>
  );
}
