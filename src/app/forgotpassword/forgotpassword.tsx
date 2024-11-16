"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Connexion() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
    
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
    
            // Vérifiez si la réponse est en JSON
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Erreur de connexion");
                }
                alert(data.message); // Confirmation à l'utilisateur
                window.location.href = '/dashboard'; // Redirige vers une page sécurisée
            } else {
                throw new Error("Erreur de serveur : réponse non JSON reçue.");
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h1 className="text-5xl text-center">Mot de passe<br />oublié</h1>
            <form onSubmit={handleSubmit}>
                <label className="input input-bordered flex items-center gap-2 my-5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-4 w-4 opacity-70">
                        <path
                        d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                        <path
                        d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                    </svg>
                    <input
                        type="text"
                        className="grow"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label className="input input-bordered flex items-center gap-2 my-5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-4 w-4 opacity-70">
                        <path
                        d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                    </svg>
                    <input
                        type="password"
                        className="grow"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" className="btn btn-primary w-full my-3">Se connecter</button>
            </form>
            <button className="btn link link-error my-3" onClick={() => router.push('/')}>Se connecter</button>
            <button className="btn link link-error my-3" onClick={() => router.push('/signin')}>S'inscrire</button>
        </div>
    );
}