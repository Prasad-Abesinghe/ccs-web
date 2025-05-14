"use client";

import { LoginForm } from "~/components/login-form";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/levels");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex flex-row items-center space-x-2">
            <Image src="/favicon-96x96.png" alt="Logo" width={32} height={32} />
            <h1 className="text-3xl font-bold tracking-tight">BEELIVE</h1>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
