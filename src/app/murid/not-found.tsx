"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MuridNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="mx-auto max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
        <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h1 className="mb-2 text-xl font-bold">Halaman tidak dijumpai</h1>
        <p className="mb-6 text-gray-500">
          Halaman yang anda cari tidak wujud atau telah dialihkan.
        </p>
        <Link href="/murid">
          <Button type="button">Kembali</Button>
        </Link>
      </div>
    </div>
  );
}
