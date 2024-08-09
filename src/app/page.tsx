import BeefTallowCalculator from "@/components/beef-tallow-calculator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <h1 className="text-2xl font-bold mb-4">Beef Tallow Calculator</h1>
      <BeefTallowCalculator />
    </main>
  );
}
