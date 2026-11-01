import Footer from "@/components/organism/Footer";
import SpeedDialComponent from "@/components/organism/SpeedDialComponent";

export default function RootShell({ children }) {
  return (
    <div className="bg-[#FFF] relative min-h-screen">
      <SpeedDialComponent />
      {children}
      <div className=" absolute bottom-0 w-full">
        <Footer />
      </div>
    </div>
  );
}
