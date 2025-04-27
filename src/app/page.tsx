import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Link from 'next/link';
import Image from 'next/image';

export default function RootPage() {
  // This page will be handled by middleware
  // It will redirect to the appropriate dashboard or login page
  return null;
}
