import { ProtectedRoute } from "@/components/Guards";
import ScannerPage from "@/views/ScannerPage";

export default function Page() {
  return <ProtectedRoute allow={["admin", "scanner", "ctrl_member"]}><ScannerPage /></ProtectedRoute>;
}
