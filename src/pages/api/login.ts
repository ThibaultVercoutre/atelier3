import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from './db';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            const connection = await connectToDatabase();

            // Récupérer l'utilisateur avec l'email ou le nom
            const [rows]: [any[], any] = await connection.execute(
                'SELECT * FROM user WHERE email = ? OR name = ?',
                [email, email]
            );

            if (rows.length === 0) {
                return res.status(401).json({ message: 'Utilisateur introuvable' });
            }

            const user = rows[0];

            // Comparer le mot de passe avec le hash stocké
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mot de passe incorrect' });
            }

            // Succès : L'utilisateur est authentifié
            res.status(200).json({ message: 'Connexion réussie', user });

            await connection.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur de connexion à la base de données' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
}
