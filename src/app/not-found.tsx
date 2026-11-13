import Link from "next/link";

export default function NotFound() {
  return <main className="not-found-page">
    <p data-preview-static="404-status">404</p>
    <h1 data-preview-static="404-title">A moment out of time.</h1>
    <p data-preview-static="404-description">The page you are looking for is not available.</p>
    <Link href="/" className="button button-navy"><span data-preview-static="404-home-link">Return to AUREL</span></Link>
  </main>;
}
