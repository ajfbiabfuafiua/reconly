import { notFound } from "next/navigation";

// Middleware rewrites unauthorized /admin requests here so they render as a
// plain 404 without hinting that the route exists.
export default function NotFound404() {
  notFound();
}
