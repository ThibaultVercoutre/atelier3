import Connexion from "./connexion";

export default function Home() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <Connexion />
        </div>
      </div>
    </div>
  );
}
