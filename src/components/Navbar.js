export default function Navbar() {
  return (
    <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
      <h1 className="text-2xl font-bold text-indigo-400">
        PitchCraft AI
      </h1>
      <button className="bg-indigo-500 px-4 py-2 rounded-lg hover:bg-indigo-600">
        Upgrade
      </button>
    </div>
  );
}