import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

// Crear una instancia global de Prisma para evitar múltiples conexiones
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const faqs = await prisma.faq.findMany({
        orderBy: {
          id: 'asc'
        }
      });

      res.status(200).json(faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ 
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
      });
    }
  } else if (req.method === "POST") {
    try {
      console.log("POST request body:", req.body);
      console.log("Content-Type:", req.headers['content-type']);
      
      const { question, answer } = req.body;

      if (!question) {
        console.log("Missing question field");
        return res.status(400).json({ 
          message: "El campo 'question' es requerido",
          received: { question, answer }
        });
      }

      if (typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ 
          message: "La pregunta debe ser un texto válido",
          received: { question: typeof question, answer: typeof answer }
        });
      }

      const answerValue = answer && typeof answer === 'string' ? answer.trim() : null;

      console.log("Creating FAQ with:", { question: question.trim(), answer: answerValue });

      const newFaq = await prisma.faq.create({
        data: {
          question: question.trim(),
          answer: answerValue
        }
      });

      console.log("FAQ created successfully:", newFaq);
      res.status(201).json(newFaq);
    } catch (error) {
      console.error("Error creating FAQ:", error);
      
      if (error instanceof Error && error.message.includes('Unknown arg')) {
        return res.status(500).json({ 
          message: "Error de base de datos: Modelo FAQ no configurado correctamente",
          error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
      }
      
      res.status(500).json({ 
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
      });
    }
  } else if (req.method === "PUT") {
    // PUT requiere todos los campos
    try {
      console.log(`PUT request body:`, req.body);
      
      const { id, question, answer } = req.body;

      if (!id) {
        return res.status(400).json({ 
          message: "El campo 'id' es requerido",
          received: { id, question, answer }
        });
      }

      if (!question) {
        return res.status(400).json({ 
          message: "El campo 'question' es requerido para PUT",
          received: { id, question, answer }
        });
      }

      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        return res.status(400).json({ 
          message: "El ID debe ser un número válido",
          received: { id, parsedId: numericId }
        });
      }

      if (typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ 
          message: "La pregunta debe ser un texto válido"
        });
      }

      const answerValue = answer && typeof answer === 'string' ? answer.trim() : null;

      const updatedFaq = await prisma.faq.update({
        where: { id: numericId },
        data: {
          question: question.trim(),
          answer: answerValue
        }
      });

      console.log("FAQ updated successfully:", updatedFaq);
      res.status(200).json(updatedFaq);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return res.status(404).json({ 
          message: "FAQ no encontrado"
        });
      }
      
      res.status(500).json({ 
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
      });
    }
  } else if (req.method === "PATCH") {
    // PATCH permite actualización parcial
    try {
      console.log(`PATCH request body:`, req.body);
      
      const { id, question, answer } = req.body;

      if (!id) {
        return res.status(400).json({ 
          message: "El campo 'id' es requerido",
          received: { id, question, answer }
        });
      }

      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        return res.status(400).json({ 
          message: "El ID debe ser un número válido",
          received: { id, parsedId: numericId }
        });
      }

      // Para PATCH, construir el objeto de datos dinámicamente
      const updateData: any = {};

      if (question !== undefined) {
        if (typeof question !== 'string' || question.trim().length === 0) {
          return res.status(400).json({ 
            message: "La pregunta debe ser un texto válido"
          });
        }
        updateData.question = question.trim();
      }

      if (answer !== undefined) {
        updateData.answer = answer && typeof answer === 'string' ? answer.trim() : null;
      }

      // Verificar que al menos un campo se está actualizando
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ 
          message: "Se debe proporcionar al menos un campo para actualizar (question o answer)",
          received: { id, question, answer }
        });
      }

      console.log("Updating FAQ with:", { id: numericId, ...updateData });

      const updatedFaq = await prisma.faq.update({
        where: { id: numericId },
        data: updateData
      });

      console.log("FAQ updated successfully:", updatedFaq);
      res.status(200).json(updatedFaq);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return res.status(404).json({ 
          message: "FAQ no encontrado"
        });
      }
      
      res.status(500).json({ 
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
      });
    }
  } else if (req.method === "DELETE") {
    try {
      console.log("DELETE request body:", req.body);
      
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ 
          message: "El campo 'id' es requerido",
          received: { id }
        });
      }

      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        return res.status(400).json({ 
          message: "El ID debe ser un número válido",
          received: { id, parsedId: numericId }
        });
      }

      await prisma.faq.delete({
        where: { id: numericId }
      });

      console.log("FAQ deleted successfully");
      res.status(200).json({ message: "FAQ eliminado correctamente" });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({ 
          message: "FAQ no encontrado"
        });
      }
      
      res.status(500).json({ 
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
      });
    }
  } else {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ 
      message: "Método no permitido",
      allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      receivedMethod: req.method
    });
  }
}