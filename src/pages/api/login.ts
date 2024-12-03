import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from './db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { FieldPacket, QueryResult } from 'mysql2';

type User = {
    id: number;
    email: string;
    name: string;
    password: string;
    admin: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        let connection;

        try {
            connection = await connectToDatabase();

            // Récupérer l'utilisateur avec l'email ou le nom
            const [rows]: [QueryResult, FieldPacket[]] = await connection.execute(
                'SELECT * FROM user WHERE email = ? OR name = ?',
                [email, email]
            );

            if ((rows as User[]).length === 0) {
                return res.status(401).json({ message: 'Utilisateur introuvable' });
            }

            const user = (rows as User[])[0];

            // Comparer le mot de passe avec le hash stocké
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mot de passe incorrect' });
            }

            // Générer un token JWT
            const accessToken = jwt.sign(
                { id: user.id, email: user.email, name: user.name, role: user.admin }, // Payload
                process.env.JWT_SECRET as string || 'votre_cle_secrete', // Clé secrète
                { expiresIn: '7d' } // Expiration
            );

            // Succès : L'utilisateur est authentifié
            res.status(200).json({ message: 'Connexion réussie', user, accessToken });
        } catch (error) {
            console.error('Erreur lors de la connexion de l\'utilisateur:', error);
            res.status(500).json({ message: 'Une erreur est survenue. Veuillez réessayer plus tard.' });
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
}
