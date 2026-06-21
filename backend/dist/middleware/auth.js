"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const supabaseClient_1 = require("../services/supabaseClient");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: 'No token provided' });
        const { data, error } = await supabaseClient_1.supabase.auth.getUser(token);
        if (error || !data.user)
            return res.status(401).json({ error: 'Invalid token' });
        // attach user to request
        req.user = data.user;
        return next();
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.requireAuth = requireAuth;
