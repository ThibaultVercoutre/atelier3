import Forgotpassword from "./forgotpassword";

export default function Home() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <Forgotpassword />
        </div>
      </div>
    </div>
  );
}
