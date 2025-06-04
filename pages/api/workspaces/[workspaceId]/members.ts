import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(410).json({ message: 'Este endpoint ha sido eliminado. Usa /api/projects/[projectId]/members.' });
}
