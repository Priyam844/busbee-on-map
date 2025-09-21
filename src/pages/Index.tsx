import BusMap from "@/components/BusMap";
import Header from "@/components/Header";
import RoutePanel from "@/components/RoutePanel";

const Index = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Header />
      <BusMap />
      <RoutePanel />
    </div>
  );
};

export default Index;
