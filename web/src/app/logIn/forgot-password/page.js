import { NotProtectedRoute } from "@/components/Guards";
import ForgotPasswordForm from "@/components/organism/ForgotPasswordForm";

export default function Page() {
  return <NotProtectedRoute><ForgotPasswordForm /></NotProtectedRoute>;
}
