import React from 'react';
import { motion } from 'framer-motion';
import "@/app/globals.css";
import NavBar from '@/components/NavBar';
import Head from 'next/head';
import FooterMain from '@/components/FooterMain';

const AboutPage = () => {
  return (
    <>
    <NavBar />
    <Head>
      <title>About Us - TotalAwareness</title>
      <meta name="description" content="Learn more about TotalAwareness, our mission, values, and commitment to excellence." />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 font-sans text-gray-800">
      <motion.header 
        className="bg-[#003366] py-16 px-5 text-white text-center rounded-lg mb-10 shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-xl max-w-3xl mx-auto">Dedicated to excellence and innovation in everything we do</p>
      </motion.header>

      <motion.section 
        className="mb-16 bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative mb-6">
          <h2 className="text-3xl font-bold text-[#003366] pb-2">Our Mission</h2>
          <div className="absolute bottom-0 left-0 w-16 h-1 bg-[#003366]"></div>
        </div>
        <p className="text-lg">Our mission is to provide innovative solutions that empower businesses to achieve their full potential through cutting-edge technology and exceptional service.</p>
      </motion.section>

      <motion.section 
        className="mb-16 bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative mb-6">
          <h2 className="text-3xl font-bold text-[#003366] pb-2">Our Values</h2>
          <div className="absolute bottom-0 left-0 w-16 h-1 bg-[#003366]"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {["Integrity", "Innovation", "Excellence", "Teamwork", "Customer Focus", "Continuous Growth"].map((value, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-[#003366] mb-2">{value}</h3>
              <p>We are committed to upholding the highest standards in our work and relationships.</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  <FooterMain />
    </>
  );
};

export default AboutPage;