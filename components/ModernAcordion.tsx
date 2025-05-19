import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Section {
  title: string;
  content: string;
}

interface Props {
  Title: string;
  sections: Section[];
}

const ModernAccordion = ({ Title, sections }: Props) => {
  const [openIndex, setOpenIndex] = useState<number>(0); // First section open by default

  const handleClick = (idx: number) => {
    // Si intentan cerrar la única sección abierta, mantenerla abierta
    if (openIndex === idx && openIndex !== -1) {
      // Solo permitir cerrar si hay otra abierta
      setOpenIndex(-1);
    } else {
      setOpenIndex(idx);
    }
  };

  return (
    <div className="w-full max-w-3xl"> {/* Aumentado de max-w-xl a max-w-3xl */}
      <h3 className="text-lg font-medium mb-3">{Title}</h3>
      <div className="space-y-1">
        {sections.map((section, idx) => (
          <div key={idx} className="border-b">
            <button
              className="w-full flex justify-between items-center py-3 text-left focus:outline-none"
              onClick={() => handleClick(idx)}
            >
              <span className="font-medium">{section.title}</span>
              <motion.span
                animate={{ rotate: openIndex === idx ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                ↓
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === idx && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: "auto", 
                    opacity: 1,
                    transition: {
                      height: { duration: 0.4, ease: "easeOut" },
                      opacity: { duration: 0.25, ease: "easeInOut" }
                    }
                  }}
                  exit={{ 
                    height: 0, 
                    opacity: 0,
                    transition: {
                      height: { duration: 0.3, ease: "easeIn" },
                      opacity: { duration: 0.25, ease: "easeInOut" }
                    }
                  }}
                  className="overflow-hidden pb-4"
                >
                  <div className="text-gray-600">{section.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernAccordion;