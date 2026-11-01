import { NotProtectedRoute } from "@/components/Guards";
import SignUp from "@/views/SignUp";

export default function Page() {
  return <NotProtectedRoute><SignUp /></NotProtectedRoute>;
}
