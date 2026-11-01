import { ProtectedRoute } from "@/components/Guards";
import ScannerPage from "@/views/ScannerPage";

export default function Page() {
  return <ProtectedRoute allow={["admin", "scanner"]}><ScannerPage /></ProtectedRoute>;
}
