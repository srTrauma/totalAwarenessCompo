import { motion } from "framer-motion";

interface Props {
  Title: string;
  text: string;
  ImageSrc: string;
}

const fadeIn = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const SimpleTextWImage = ({ Title, text, ImageSrc }: Props) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
    variants={fadeIn}
    className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-lg p-6 md:p-10 gap-6 md:gap-10"
  >
    <div className="flex-1">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">{Title}</h2>
      <p className="text-gray-700 text-base md:text-lg">{text}</p>
    </div>
    <motion.img
      src={ImageSrc}
      alt={Title}
      className="w-40 h-40 md:w-56 md:h-56 object-contain rounded-xl shadow-md"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    />
  </motion.div>
);

export default SimpleTextWImage;