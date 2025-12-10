// src/pages/About.jsx
import React from "react";
import about1 from "../assets/about/about1.jpg";
import aboutImg2 from "../assets/about/aboutImg2.jpg";
import aboutImg5 from "../assets/about/aboutImg5.png";





function About() {
  return (
    <div className="bg-white min-h-screen py-16 px-6 md:px-12 lg:px-24">
      {/* TOP HERO SECTION */}
      <section className="grid md:grid-cols-2 gap-10 items-center mb-16">
        {/* Text */}
        <div>
          <p className="uppercase tracking-[0.25em] text-xs text-gray-400 mb-2">
            DESIGN • BEAUTY • CARE
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Nothing can stop
            <br />
            <span className="text-pink-500">a good idea in beauty.</span>
          </h1>
          <p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">
            At <span className="font-semibold">BeautyE</span>, we blend skincare
            science with luxurious textures and soothing rituals. Every formula
            is curated to feel like a small celebration – clean ingredients,
            cruelty-free testing, and packaging you’ll love to keep on display.
          </p>

          <button className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-pink-500">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 text-white">
              ►
            </span>
            Intro Video
          </button>
        </div>

        {/* Visual product block */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-[2.5rem] bg-pink-100/70 blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-[3rem] bg-orange-100/60 blur-2xl" />

            <div className="relative bg-gradient-to-br from-orange-50 to-rose-50 rounded-[2.5rem] p-10 shadow-xl">
              <div className="flex flex-col items-center gap-4">
                {/* Fake bottle */}
                <div className="relative">
<img
  src={aboutImg2}
  alt="Beauty Product"
  className="h-48 object-contain drop-shadow-xl"
/>
                </div>

                <p className="text-xs tracking-[0.25em] uppercase text-gray-400">
                  premium formula
                </p>
                <p className="text-sm text-center text-gray-600">
                  Silky textures, weightless feel and a finish that looks like
                  your skin – only better.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MIDDLE FEATURE BLOCK (like FOXPRO section) */}
      <section className="grid md:grid-cols-2 gap-10 items-center mb-16">
        {/* Image side */}
        <div className="order-2 md:order-1 flex justify-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute -top-6 -left-4 w-24 h-24 rounded-[2rem] bg-rose-200/60 blur-2xl" />
            <div className="relative bg-[#ffe1e3] rounded-[2.5rem] p-10 shadow-xl">
              <div className="flex flex-col items-center gap-5">
<img
  src={about1}
  alt="Luxury Care"
  className="h-52 object-contain drop-shadow-2xl"
/>
                <div className="flex gap-3 text-xs text-gray-600">
                  <span className="px-3 py-1 rounded-full bg-white/70">
                    Sulphate-free
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/70">
                    Dermat-tested
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text side */}
        <div className="order-1 md:order-2">
          <p className="uppercase tracking-[0.35em] text-xs text-gray-400 mb-2">
            foxpro concept
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
            Product designing idea, refined for modern beauty rituals.
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3">
            We obsess over every curve of the bottle, every texture of the cap
            and every detail of the label. Your vanity shelf should feel like a
            gallery – clean, minimal and uniquely yours.
          </p>
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
            Our packaging is made to be refill-friendly and recyclable wherever
            possible, so luxury doesn’t have to come at the planet&apos;s
            expense.
          </p>
        </div>
      </section>

      {/* BOTTOM FEATURE BLOCK (like “Your product for future”) */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        {/* Text */}
        <div>
          <p className="text-sm md:text-base text-gray-500 mb-1">
            Your product for the{" "}
            <span className="font-semibold text-pink-500">future.</span>
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
            Thoughtfully built formulas for skin that lives online and offline.
          </h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3">
            Blue-light, pollution, stress, late nights – your skin deals with
            more than ever before. Our lab-driven actives and calming botanicals
            are balanced to protect, repair and glow.
          </p>
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-5">
            From the first swipe to the last pump, we want every interaction to
            feel intuitive, safe and a little bit indulgent.
          </p>
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 border-b border-pink-500">
            Order now
            <span>→</span>
          </button>
        </div>

        {/* Visual card */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute -top-6 right-0 w-24 h-24 rounded-[2.5rem] bg-indigo-200/60 blur-2xl" />
            <div className="relative bg-[#f1e9ff] rounded-[2.5rem] p-10 shadow-xl">
              <div className="flex flex-col items-center gap-5">
<img
  src={aboutImg5}
  alt="Future Product"
  className="h-52 object-contain drop-shadow-2xl"
/>
                <div className="flex gap-3 text-xs text-gray-600">
                  <span className="px-3 py-1 rounded-full bg-white/70">
                    Vegan
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/70">
                    Cruelty-free
                  </span>
                </div>
                <p className="text-xs text-center text-gray-600">
                  Designed to pair with your entire routine – serums, mists,
                  masks and everything in between.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTNOTE */}
      <div className="text-center text-[11px] text-gray-400 mt-16 tracking-[0.25em] uppercase">
        designed for beauty lovers • crafted with care
      </div>
    </div>
  );
}

export default About;
