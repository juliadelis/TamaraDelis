import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabaseClient';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });

    // attach user to request
    (req as any).user = data.user;
    return next();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
