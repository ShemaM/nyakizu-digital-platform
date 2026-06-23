import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { MarketplaceClient } from "@/components/marketplace/MarketplaceClient";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <MarketplaceClient />
      </main>
      <Footer />
    </>
  );
}
