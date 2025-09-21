import SimpleMap from "@/components/SimpleMap";
import Header from "@/components/Header";
import RoutePanel from "@/components/RoutePanel";

const Index = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Header />
      <SimpleMap />
      <RoutePanel />
    </div>
  );
};

export default Index;
