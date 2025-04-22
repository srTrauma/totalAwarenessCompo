import Button from "@/components/Button";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import { useEffect, useState } from "react";
import "@/app/globals.css";

export default function MainLogin() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/Login");
    }
  }, [router]);

  return (
    <main>
      <NavBar></NavBar>
    <div className="flex flex-col items-center justify-center gap-10">
      <h1>Hola, {user?.name}!</h1>
      {user?.email && <p>Tu correo es {user.email}</p>}
      {user?.id && <p>Tu ID es {user.id}</p>}
      
      <div onClick={() => {
        localStorage.removeItem("user");
        router.push("/Login");
      }}>
        <Button Text="Cerrar Sesión" />
      </div>
    </div>
    </main>
  );
}