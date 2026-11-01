import { ProtectedRoute } from "@/components/Guards";
import AdminLayout from "@/views/admin/AdminLayout";

export default function Layout({ children }) {
  return <ProtectedRoute allow={["admin", "ctrl_member"]}><AdminLayout>{children}</AdminLayout></ProtectedRoute>;
}
