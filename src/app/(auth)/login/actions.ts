"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(email: string, password: string): Promise<{ error?: string }> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    console.log("[loginAction] error type:", Object.prototype.toString.call(error));
    console.log("[loginAction] error:", JSON.stringify(error, null, 2));
    console.log("[loginAction] error instanceof AuthError:", error instanceof AuthError);
    if (error instanceof AuthError) {
      console.log("[loginAction] AuthError type:", error.type);
      return { error: "Credenciales incorrectas. Intente nuevamente." };
    }
    // signIn lanza un redirect como excepción — hay que re-lanzarlo
    throw error;
  }
}
