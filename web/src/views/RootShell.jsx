import Footer from "@/components/organism/Footer";
import SiteHeader from "@/components/organism/SiteHeader";

export default function RootShell({ children, header = true }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-navy-deep">
      {header && <SiteHeader />}
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
