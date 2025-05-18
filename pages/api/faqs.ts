import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const faqs = await prisma.fAQ.findMany();
      res.status(200).json(faqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ error: 'Error fetching FAQs' });
    }
  } else if (req.method === 'POST') {
    try {
      const { question, answer } = req.body;

      if (!question || question.trim() === '') {
        return res.status(400).json({ error: 'La pregunta es obligatoria.' });
      }

      const newFAQ = await prisma.fAQ.create({
        data: { question, answer: answer || null },
      });
      res.status(201).json(newFAQ);
    } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({ error: 'Error creating FAQ' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id, answer } = req.body;

      if (!id || !answer) {
        return res.status(400).json({ error: 'ID y respuesta son obligatorios.' });
      }

      const updatedFAQ = await prisma.fAQ.update({
        where: { id },
        data: { answer },
      });
      res.status(200).json(updatedFAQ);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ error: 'Error updating FAQ' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}