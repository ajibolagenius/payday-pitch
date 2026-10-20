export const metadata = { title: "Offline · Payday Pitch" };

export default function Offline() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 px-4 py-16 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">You are offline</h1>
      <p>
        Pages you opened recently still work. Saving needs a connection, so
        try again once you are back online.
      </p>
    </main>
  );
}
