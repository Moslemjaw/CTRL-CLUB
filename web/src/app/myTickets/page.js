import { ProtectedRoute } from "@/components/Guards";
import RootShell from "@/views/RootShell";
import MyTickets from "@/views/MyTickets";

export default function Page() {
  return <ProtectedRoute allow={["user", "admin"]}><RootShell><MyTickets /></RootShell></ProtectedRoute>;
}
