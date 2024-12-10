import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from './db';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { FieldPacket, QueryResult } from 'mysql2';

type User = {
    id: number;
    username: string;
    email: string;
    password: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email } = req.body;

        try {
            const connection = await connectToDatabase();

            function generateTemporaryPassword(length: number): string {
                const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let password = '';
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * charset.length);
                    password += charset[randomIndex];
                }
                return password;
            }

            const temporaryPassword = generateTemporaryPassword(16);

            const [rows]: [QueryResult, FieldPacket[]] = await connection.execute(
                'SELECT * FROM user WHERE email = ?',
                [email]
            );

            if ((rows as User[]).length > 0) {
                const transporter = nodemailer.createTransport({
                    host: process.env.MODE == 'prod' ? process.env.MAIL_HOST : 'localhost',
                    port: process.env.MODE == 'prod' ? Number(process.env.MAIL_PORT) : 1025,
                    secure: false,      // Pas de TLS pour un serveur local
                    auth: {
                        user: process.env.MODE == 'prod' ? 'no-reply@atelier.com' : '',  // Adresse email d'envoi
                        pass: process.env.MODE == 'prod' ? 'no-reply' : '',    // Mot de passe de l'email (si requis)
                    },
                });

                const mailOptions = {
                    from: 'no-reply@example.com',
                    to: email,
                    subject: 'Réinitialisation de mot de passe',
                    text: `Bonjour ${(rows as User[])[0].username},\n\nVoici votre mot de passe temporaire : ${temporaryPassword}`,
                };

                await transporter.sendMail(mailOptions);

                const hashedTemporaryPassword = await bcrypt.hash(temporaryPassword, 10);

                await connection.execute(
                    'UPDATE user SET password = ? WHERE email = ?',
                    [hashedTemporaryPassword, email]
                );

                res.status(200).json({ message: 'Un email de réinitialisation de mot de passe a été envoyé.' });
            } else {
                res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email.' });
            }

            await connection.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur de connexion à la base de données', error: error });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
}