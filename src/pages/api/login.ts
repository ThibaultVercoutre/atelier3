import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../pages/api/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            const connection = await connectToDatabase();
            const [rows, fields]: [any[], any[]] = await connection.execute(
                'SELECT * FROM user WHERE (email = ? OR name = ?) AND password = ?',
                [email, email, password]
            );

            if ((rows as any[]).length > 0) {
                res.status(200).json({ message: 'Connexion réussie', user: rows[0] });
            } else {
                res.status(401).json({ message: {rows} });
            }

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
