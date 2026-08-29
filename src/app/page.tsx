import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/features/auth";
import { BACKEND_BASE_URL } from "@/lib/bff-proxy";

const SESSION_COOKIE_NAME = "sk_quiz_sesi";

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    redirect("/login");
  }

  const response = await fetch(`${BACKEND_BASE_URL}/auth/me`, {
    cache: "no-store",
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}`,
    },
  });

  if (!response.ok) {
    redirect("/login");
  }

  const envelope = (await response.json()) as { data: SessionUser };
  const user = envelope.data;

  if (user.mesti_tukar_kata_laluan) {
    redirect("/login");
  }

  if (user.role === "super_admin" || user.role === "admin") {
    redirect("/admin");
  }

  redirect("/murid");
}
