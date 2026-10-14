import { useEffect } from "react";
import Lenis from "lenis";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Research from "../components/Research";
import Team from "../components/Team";
import Publications from "../components/Publications";
import Projects from "../components/Projects";
import News from "../components/News";
import Partners from "../components/Partners";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let id;
    const raf = (time) => { lenis.raf(time); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);

  return (
    <div className="noise-overlay min-h-screen bg-[#07090E]">
      <Header />
      <main>
        <Hero />
        <About />
        <Research />
        <Team />
        <Publications />
        <Projects />
        <News />
        <Partners />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
