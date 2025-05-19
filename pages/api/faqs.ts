import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const faqs = await prisma.FAQ.findMany(); // <-- Corregido a fAQ
      res.status(200).json(faqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ error: 'Error al obtener las FAQs' });
    }
  } else if (req.method === 'POST') {
    try {
      const { question } = req.body;
      const newFAQ = await prisma.FAQ.create({ // <-- Corregido a fAQ
        data: { question },
      });
      res.status(201).json(newFAQ);
    } catch (error) {
      console.error('Error adding FAQ:', error);
      res.status(500).json({ error: 'Error al añadir la FAQ' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id, answer } = req.body;
      const updatedFAQ = await prisma.FAQ.update({ // <-- Corregido a fAQ
        where: { id },
        data: { answer },
      });
      res.status(200).json(updatedFAQ);
    } catch (error) {
      console.error('Error responding to FAQ:', error);
      res.status(500).json({ error: 'Error al responder la FAQ' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}