"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseClient_1 = require("../services/supabaseClient");
const router = (0, express_1.Router)();
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required' });
        const { data, error } = await supabaseClient_1.supabase.auth.signInWithPassword({ email, password });
        if (error)
            return res.status(401).json({ error: error.message });
        // data contains session and user
        return res.json({ session: data.session, user: data.user });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Optional: logout (client can also just drop tokens)
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token)
            return res.status(400).json({ error: 'No token provided' });
        // Supabase signOut intended for client; here we call via helper endpoint
        // The supabase-js server SDK does not accept an explicit token to sign out,
        // but we can revoke the refresh token via the Admin API if needed.
        // For now, respond OK and let client drop tokens.
        return res.json({ message: 'Logged out on client (drop tokens)' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
