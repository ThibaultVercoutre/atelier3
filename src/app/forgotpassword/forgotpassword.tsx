"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation de l'email
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError("Veuillez entrer une adresse email valide.");
            return;
        }

        try {
            const res = await fetch('/api/forgotpassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            // Vérifiez si la réponse est en JSON
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Erreur de serveur inconnue.");
                }
                alert(data.message); // Confirmation à l'utilisateur
                router.push('/'); // Redirige l'utilisateur vers la page d'accueil
            } else {
                throw new Error("Erreur de serveur : réponse non JSON reçue.");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
                console.log(err);
            } else {
                setError("Une erreur inattendue s'est produite.");
            }
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
                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" className="btn btn-primary w-full my-3">Réinitialiser</button>
            </form>
            <button className="btn link link-error my-3" onClick={() => router.push('/')}>Se connecter</button>
            <button className="btn link link-error my-3" onClick={() => router.push('/signin')}>S&apos;inscrire</button>
        </div>
    );
}
