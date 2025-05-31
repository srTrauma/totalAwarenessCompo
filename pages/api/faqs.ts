import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const faqs = await prisma.faq.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      res.status(200).json(faqs);
    } else if (req.method === "POST") {
      console.log("POST request body:", req.body);
      
      const { question, answer, profile, userId, userName } = req.body;

      // Validación de pregunta (requerida)
      if (!question) {
        console.log("Validation error: question is missing");
        return res.status(400).json({
          message: "La pregunta es requerida",
          field: "question",
          received: question
        });
      }

      if (typeof question !== 'string' || question.trim().length === 0) {
        console.log("Validation error: question is empty or not string");
        return res.status(400).json({
          message: "La pregunta es requerida y debe ser un texto válido",
          field: "question",
          received: question
        });
      }

      // Validación de respuesta (opcional, puede estar vacía)
      const answerValue = answer && typeof answer === 'string' ? answer.trim() : '';
      
      // Profile es opcional
      const profileValue = profile && typeof profile === 'string' && profile.trim().length > 0 ? profile.trim() : undefined;

      // Información del usuario que crea la pregunta
      const createdByUserId = userId ? parseInt(userId) : null;
      const createdByUserName = userName && typeof userName === 'string' ? userName.trim() : null;

      console.log("Creating FAQ with data:", {
        question: question.trim(),
        answer: answerValue,
        profile: profileValue,
        createdByUserId,
        createdByUserName
      });

      const newFaq = await prisma.faq.create({
        data: {
          question: question.trim(),
          answer: answerValue,
          profile: profileValue,
          createdByUserId,
          createdByUserName,
          // Si ya tiene respuesta, también guardar quién la respondió
          respondedByUserId: answerValue ? createdByUserId : null,
          respondedByUserName: answerValue ? createdByUserName : null,
          respondedAt: answerValue ? new Date() : null
        }
      });

      console.log("FAQ created successfully:", newFaq);
      res.status(201).json(newFaq);
    } else if (req.method === "PATCH") {
      console.log("PATCH request body:", req.body);
      
      const { id, question, answer, profile, userId, userName } = req.body;

      if (!id) {
        return res.status(400).json({
          message: "El ID es requerido",
          field: "id",
          received: id
        });
      }

      // Construir objeto de actualización solo con campos proporcionados
      const updateData: any = {};

      // Solo validar y actualizar question si se proporciona
      if (question !== undefined) {
        if (typeof question !== 'string' || question.trim().length === 0) {
          return res.status(400).json({
            message: "La pregunta debe ser un texto válido",
            field: "question",
            received: question
          });
        }
        updateData.question = question.trim();
      }

      // Solo actualizar answer si se proporciona
      if (answer !== undefined) {
        updateData.answer = typeof answer === 'string' ? answer.trim() : '';
        
        // Si se está actualizando la respuesta, guardar información del usuario que responde
        if (updateData.answer && updateData.answer.length > 0) {
          if (userId) {
            updateData.respondedByUserId = parseInt(userId);
          }
          if (userName && typeof userName === 'string') {
            updateData.respondedByUserName = userName.trim();
          }
          updateData.respondedAt = new Date();
        } else {
          // Si se está borrando la respuesta, limpiar la información del respondedor
          updateData.respondedByUserId = null;
          updateData.respondedByUserName = null;
          updateData.respondedAt = null;
        }
      }

      // Solo actualizar profile si se proporciona
      if (profile !== undefined) {
        updateData.profile = profile && typeof profile === 'string' && profile.trim().length > 0 ? profile.trim() : null;
      }

      console.log("Updating FAQ with data:", updateData);

      const updatedFaq = await prisma.faq.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      res.status(200).json(updatedFaq);    } else if (req.method === "DELETE") {
      console.log("DELETE request body:", req.body);
      
      const { id, userId, action } = req.body;

      if (!id) {
        return res.status(400).json({
          message: "El ID es requerido",
          field: "id",
          received: id
        });
      }

      if (!userId) {
        return res.status(400).json({
          message: "El ID del usuario es requerido",
          field: "userId",
          received: userId
        });
      }

      // Obtener la FAQ para verificar permisos
      const existingFaq = await prisma.faq.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingFaq) {
        return res.status(404).json({
          message: "FAQ no encontrado"
        });
      }

      const userIdInt = parseInt(userId);

      if (action === "delete-answer") {
        // Solo el usuario que respondió puede eliminar la respuesta
        if (existingFaq.respondedByUserId !== userIdInt) {
          return res.status(403).json({
            message: "No tienes permisos para eliminar esta respuesta"
          });
        }

        // Eliminar solo la respuesta, mantener la pregunta
        const updatedFaq = await prisma.faq.update({
          where: { id: parseInt(id) },
          data: {
            answer: null,
            respondedByUserId: null,
            respondedByUserName: null,
            respondedAt: null
          }
        });

        res.status(200).json({
          message: "Respuesta eliminada correctamente",
          faq: updatedFaq
        });
      } else {
        // Eliminar toda la FAQ - solo el usuario que creó la pregunta puede hacerlo
        if (existingFaq.createdByUserId !== userIdInt) {
          return res.status(403).json({
            message: "No tienes permisos para eliminar esta pregunta"
          });
        }

        await prisma.faq.delete({
          where: { id: parseInt(id) }
        });

        res.status(200).json({ message: "FAQ eliminado correctamente" });
      }
    } else {
      res.status(405).json({ message: "Método no permitido" });
    }
  } catch (error) {
    console.error("Error in FAQ API:", error);
    
    // Manejo específico de errores de Prisma
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(400).json({
        message: "Ya existe una FAQ con estos datos",
        error: "Duplicate entry"
      });
    }
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        message: "FAQ no encontrado",
        error: "Record not found"
      });
    }

    res.status(500).json({
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Error desconocido') : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}