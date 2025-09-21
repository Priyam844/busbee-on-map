import SimpleMap from "@/components/SimpleMap";
import Header from "@/components/Header";
import RoutePanel from "@/components/RoutePanel";
import { SearchProvider } from "@/contexts/SearchContext";

const Index = () => {
  return (
    <SearchProvider>
      <div className="relative w-full h-screen overflow-hidden">
        <Header />
        <SimpleMap />
        <RoutePanel />
      </div>
    </SearchProvider>
  );
};

export default Index;
