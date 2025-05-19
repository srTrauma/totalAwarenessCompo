"use client"

import "./globals.css";
import FooterMain from "@/components/FooterMain";
import Start from "@/components/Start";
import MarquesinaTexto from "@/components/MarquesinaTexto";
import NavBar from "@/components/NavBar";
import SimpleTextWImage from "@/components/SimpleTextWImage";
import NobgTextwImage from "@/components/NobgTextwImage";
import ModernAccordion from "@/components/ModernAcordion";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const HomePage = () => {
  const sections = [
    { 
      title: 'Nuestra Visión', 
      content: 'Transformar la experiencia digital mediante soluciones innovadoras que conecten personas y tecnología de manera significativa, priorizando la simplicidad y la eficacia.' 
    },
    { 
      title: 'Nuestro Enfoque', 
      content: 'Aplicamos metodologías ágiles y centradas en el usuario para desarrollar productos que resuelvan problemas reales con un diseño limpio y funcional.' 
    },
    { 
      title: 'Compromiso', 
      content: 'Nos dedicamos a ofrecer excelencia técnica y atención personalizada, construyendo relaciones a largo plazo basadas en resultados tangibles y confianza mutua.' 
    },
  ];
  
  return (
    <main className="flex flex-col gap-12 bg-neutral-50 text-neutral-800">
      <div className="flex flex-col">
        <NavBar />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Start />
        </motion.div>
      </div>
      
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeInUp}
        className="py-4 bg-white"
      >
        <MarquesinaTexto />
      </motion.div>
      
      <section className="max-w-3xl mx-auto px-2 sm:px-4">
        <SimpleTextWImage
          Title="Soluciones Digitales Innovadoras"
          text="Creamos experiencias digitales que combinan diseño minimalista con funcionalidad avanzada. Nuestro enfoque se centra en la simplicidad visual y la robustez técnica, ofreciendo soluciones que no solo destacan por su estética, sino por su capacidad para resolver problemas complejos de manera intuitiva."
          ImageSrc="/imagesToGuapas/coso.png"
        />
      </section>
      
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeInUp}
        className="bg-neutral-100 py-8 w-full"
      >
        <div className="max-w-3xl mx-auto px-2 sm:px-4">
          <NobgTextwImage 
            Title="Tecnología con Propósito" 
            imgUrl="/imagesToGuapas/coso.png" 
            content="Utilizamos tecnologías de vanguardia para desarrollar plataformas escalables que evolucionan con las necesidades de nuestros clientes. Cada proyecto es una oportunidad para innovar y crear valor duradero mediante soluciones técnicas elegantes y eficientes."
          />
        </div>
      </motion.section>
      
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeInUp}
        className="max-w-3xl mx-auto px-2 sm:px-4 py-8"
      >
        <h2 className="text-2xl font-light mb-6 text-center">Nuestros Principios</h2>
        <div className="flex flex-col w-full justify-center items-center">
          <ModernAccordion Title="Filosofía Empresarial" sections={sections}/>
        </div>
      </motion.section>
      
      <FooterMain />
    </main>
  );
};

export default HomePage;