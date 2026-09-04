"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="pt-16 lg:pt-20">
      {/* Hero */}
      <section className="relative py-24 lg:py-32 border-b border-border overflow-hidden">
        <Image
          src="/images/editorial/dawn-sky-horizon.jpg"
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <p className="text-accent text-xs uppercase tracking-[0.3em] mb-4">
            Our Story
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium max-w-3xl">
            Above the Horizon
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-lg leading-relaxed text-muted"
          >
            <p>
              The Booming Dawn is a Cairo-born streetwear label. We started
              with a simple belief: fashion had become background noise,
              everyone wearing the same safe pieces, playing it safe, fading
              into a crowd of sameness.
            </p>
            <p>
              We set out to change that. To create clothing with an opinion.
              Pieces that announce themselves before you say a word. Soft
              cotton, loud graphics, and a construction standard that respects
              both the garment and the person wearing it.
            </p>
            <p>
              Our debut collection, &quot;The 3 Stages of Dawn,&quot; walks through the
              calm, the wonder, and the build, three statement tees designed
              here in Egypt to be worn anywhere in the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-20 bg-surface border-y border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-10">
          {[
            {
              title: "Craft",
              text: "Premium materials and meticulous construction in every single piece.",
            },
            {
              title: "Confidence",
              text: "Designs that make a statement without apology or compromise.",
            },
            {
              title: "Community",
              text: "Built for the bold, the ones who define their own rules.",
            },
          ].map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border border-border p-8"
            >
              <h3 className="font-display text-booming-red text-xl mb-3">
                <span className="text-accent">0{i + 1}</span> · {value.title}
              </h3>
              <p className="text-muted leading-relaxed">{value.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
