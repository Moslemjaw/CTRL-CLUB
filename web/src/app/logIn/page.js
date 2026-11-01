import { NotProtectedRoute } from "@/components/Guards";
import LogInForm from "@/components/organism/LogInForm";

export default function Page() {
  return <NotProtectedRoute><LogInForm /></NotProtectedRoute>;
}
