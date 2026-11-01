import { ProtectedRoute } from "@/components/Guards";
import AdminLayout from "@/views/admin/AdminLayout";

export default function Layout({ children }) {
  return <ProtectedRoute allow={["admin"]}><AdminLayout>{children}</AdminLayout></ProtectedRoute>;
}
