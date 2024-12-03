'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "./loading";
import Navbar from "./navbar";

type User = {
  username: string;
  email: string;
  // Ajoutez d'autres propriétés ici selon votre JWT
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessJwt");

    if (!token) {
      router.push("/"); // Redirige vers la page de connexion si aucun token
      return;
    }

    try {
      // Décoder le token pour obtenir les données utilisateur
      const payload = JSON.parse(atob(token.split(".")[1])); // Récupère le payload du JWT
      setUser(payload);
    } catch (error) {
      console.error("Token invalide :", error);
      localStorage.removeItem("accessJwt"); // Supprime le token invalide
      router.push("/");
    } finally {
      setLoading(false); // Terminer le chargement
    }
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <p>Redirection...</p>; // Éviter un affichage vide
  }

  return (
    <div className="bg-base-200 min-h-screen">
      <Navbar />
      <div className="hero bg-base-200">
        <div className="hero-body">
          <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
          <p>Bienvenue, {user.username} !</p>
        </div>
      </div>
    </div>
  );
}
