import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // Simuler une vérification des identifiants
        if (email === 'user@example.com' && password === 'password123') {
            return res.status(200).json({ message: 'Connexion réussie', token: 'fake-jwt-token' });
        } else {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
}