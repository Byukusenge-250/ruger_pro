import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-semibold tracking-tight text-ink-900">404</p>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
