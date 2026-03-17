"use client";
import dynamic from "next/dynamic";

const MotovibezApp = dynamic(() => import("@/components/MotovibezApp"), { ssr: false });

export default function Page() {
  return <MotovibezApp />;
}
