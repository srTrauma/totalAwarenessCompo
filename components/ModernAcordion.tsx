import { useState } from "react";
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-xl">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">{Title}</h3>
      <div className="space-y-2">
        {sections.map((section, idx) => (
          <div key={idx} className="border rounded-lg shadow-sm bg-white">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-left focus:outline-none transition-colors hover:bg-blue-50"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <span className="font-medium text-blue-900">{section.title}</span>
              <motion.span
                animate={{ rotate: openIndex === idx ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-2 text-blue-700"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === idx && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden px-4 pb-3"
                >
                  <div className="text-gray-700">{section.content}</div>
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