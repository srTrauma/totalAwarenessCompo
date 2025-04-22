"use client"

import "./globals.css";
import FooterMain from "@/components/FooterMain";
import Start from "@/components/Start";
import MarquesinaTexto from "@/components/MarquesinaTexto";
import NavBar from "@/components/NavBar";
import SimpleTextWImage from "@/components/SimpleTextWImage";
import NobgTextwImage from "@/components/NobgTextwImage";
import ModernAccordion from "@/components/ModernAcordion";


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
    <main className="flex flex-col gap-[7rem] bg-neutral-50 text-neutral-800">
      <div className="flex flex-col">
        <NavBar />
        <Start />
      </div>
      
      <div className="py-8 bg-white">
        <MarquesinaTexto />
      </div>
      
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <SimpleTextWImage
          Title="Soluciones Digitales Innovadoras"
          text="Creamos experiencias digitales que combinan diseño minimalista con funcionalidad avanzada. Nuestro enfoque se centra en la simplicidad visual y la robustez técnica, ofreciendo soluciones que no solo destacan por su estética, sino por su capacidad para resolver problemas complejos de manera intuitiva."
          ImageSrc="/imagesToGuapas/coso.png"
        />
      </section>
      
      <section className="bg-neutral-100 py-16 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <NobgTextwImage 
            Title="Tecnología con Propósito" 
            imgUrl="/imagesToGuapas/coso.png" 
            content="Utilizamos tecnologías de vanguardia para desarrollar plataformas escalables que evolucionan con las necesidades de nuestros clientes. Cada proyecto es una oportunidad para innovar y crear valor duradero mediante soluciones técnicas elegantes y eficientes."
          />
        </div>
      </section>
      
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-light mb-10 text-center">Nuestros Principios</h2>
        <div className="flex flex-col w-full justify-center items-center">
          <ModernAccordion Title="Filosofía Empresarial" sections={sections}/>
        </div>
      </section>
      
      <FooterMain />
    </main>
  );
};

export default HomePage;