import { redirect } from "next/navigation";

// Registro deshabilitado — los usuarios solo pueden ser creados por un administrador
export default function RegisterPage() {
  redirect("/");
}
