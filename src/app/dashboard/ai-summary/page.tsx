
"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AISummaryPage() {
  useEffect(() => {
    redirect("/dashboard");
  }, []);

  return null;
}
