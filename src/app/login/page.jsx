import { Suspense } from "react";
import { LoginView } from "@/components/LoginView";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Cargando...
        </div>
      }
    >
      <LoginView />
    </Suspense>
  );
}
