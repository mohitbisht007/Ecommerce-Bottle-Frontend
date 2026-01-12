import AdminSidebar from "@/app/components/AdminSidebar";
import AdminTopbar from "@/app/components/AdminTopbar";

export default function AdminRootLayout({ children }) {
  return (
    <div className="admin-container">
      {/* Sidebar is fixed on the left */}
      <AdminSidebar />
      
      <div className="admin-main-wrapper">
        {/* Topbar is fixed at the top of the content area */}
        <AdminTopbar />
        
        {/* This is where your specific pages (Overview, Products, etc.) will render */}
        <main className="admin-content-area">
          {children}
        </main>
      </div>
    </div>
  );
}