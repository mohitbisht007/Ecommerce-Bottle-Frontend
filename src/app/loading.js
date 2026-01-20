import PageLoader from "./(shop)/components/PageLoader";

export default function Loading() {
  // Next.js will wrap your page content in a <Suspense> boundary 
  // and show this component automatically.
  return <PageLoader />;
}