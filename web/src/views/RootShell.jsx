import Footer from "@/components/organism/Footer";
import SpeedDialComponent from "@/components/organism/SpeedDialComponent";

export default function RootShell({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-navy-deep">
      <SpeedDialComponent />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
