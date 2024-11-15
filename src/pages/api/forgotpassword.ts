import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../pages/api/db';
import nodemailer from 'nodemailer';

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

            const [rows, fields]: [any[], any[]] = await connection.execute(
                'SELECT * FROM user WHERE email = ?',
                [email]
            );

            if ((rows as any[]).length > 0) {
                const transporter = nodemailer.createTransport({
                    host: 'localhost',
                    port: 1025,
                    ignoreTLS: true,
                });

                const mailOptions = {
                    from: 'no-reply@example.com',
                    to: email,
                    subject: 'Réinitialisation de mot de passe',
                    text: `Bonjour ${rows[0].username},\n\nVoici votre mot de passe temporaire : ${temporaryPassword}`,
                };

                await transporter.sendMail(mailOptions);

                await connection.execute(
                    'UPDATE user SET password = ? WHERE email = ?',
                    [temporaryPassword, email]
                );

                res.status(200).json({ message: 'Un email de réinitialisation de mot de passe a été envoyé.' });
            } else {
                res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email.' });
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