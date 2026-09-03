import { Hero } from "@/components/home/hero";
import { DawnStages } from "@/components/home/dawn-stages";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { NewArrivals } from "@/components/home/new-arrivals";
import { Editorial } from "@/components/home/editorial";
import { Newsletter } from "@/components/home/newsletter";
import { Slogan } from "@/components/brand/Slogan";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DawnStages />
      <FeaturedCollections />
      <NewArrivals />
      <Editorial />
      <section className="py-24 bg-background border-y border-border text-center">
        <Slogan />
      </section>
      <Newsletter />
    </>
  );
}
