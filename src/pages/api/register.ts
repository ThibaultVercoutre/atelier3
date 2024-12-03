import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from './db';
import bcrypt from 'bcrypt';
import { FieldPacket, QueryResult } from 'mysql2';

type User = {
    id: number;
    email: string;
    name: string;
    password: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, name, password } = req.body;

        let connection;

        try {
            connection = await connectToDatabase();

            // Faille intentionnelle pour le CTF (SQL Injection)
            const query = `SELECT * FROM user WHERE name = '${name}' or email = '${email}'`;
            console.log("Query potentiellement injectable :", query);

            const [existingUser]: [QueryResult, FieldPacket[]] = await connection.execute(query);

            if ((existingUser as User[]).length > 0) {
                res.status(400).json({ message: 'Un utilisateur avec ce nom ou cet email existe déjà.' });
                return;
            }

            // Hachage du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Ajout d'un nouvel utilisateur (requête sécurisée)
            await connection.execute(
                'INSERT INTO user (email, name, password) VALUES (?, ?, ?)',
                [email, name, hashedPassword]
            );

            res.status(200).json({ message: 'Inscription réussie. Vous pouvez maintenant vous connecter.' });
        } catch (error) {
            console.error('Erreur lors de l\'inscription de l\'utilisateur :', error);
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
