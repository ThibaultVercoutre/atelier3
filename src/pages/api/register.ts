import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../pages/api/db';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, name, password } = req.body;

        try {
            const connection = await connectToDatabase();

            const query = `SELECT * FROM user WHERE name = '${name}' or email = '${email}'`;
            const [existingUser]: [any[], any] = await connection.execute(query); 

            if (existingUser.length > 0) {
                res.status(400).json({ message: 'Un utilisateur avec ce nom existe déjà' });
                await connection.end();
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [rows, fields]: [any[], any[]] = await connection.execute(
                'INSERT INTO user (email, name, password) VALUES (?, ?, ?)',
                [email, name, hashedPassword]
            );

            res.status(200).json({ message: 'Inscription réussie' });

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