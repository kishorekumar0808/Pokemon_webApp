import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Pokemon {
  name: string;
  url: string;
}

export default function PokemonList() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollPosition = useRef(0);
  const navigate = useNavigate();

  const fetchPokemons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=50&offset=0"
      );
      if (!res.ok) throw new Error("Failed to fetch Pokémon");
      const data = await res.json();
      setPokemons(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemons();
  }, []);

  // Save scroll position before navigating away
  useEffect(() => {
    const saveScroll = () => {
      scrollPosition.current = window.scrollY;
    };
    window.addEventListener("beforeunload", saveScroll);
    return () => window.removeEventListener("beforeunload", saveScroll);
  }, []);

  // Restore scroll when returning
  useEffect(() => {
    if (!loading && scrollPosition.current > 0) {
      window.scrollTo(0, scrollPosition.current);
    }
  }, [loading]);

  const getIdFromUrl = (url: string) => url.split("/").filter(Boolean).pop();

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 border-2 border-dashed rounded-xl h-40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={fetchPokemons}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {pokemons.map((pokemon) => {
        const id = getIdFromUrl(pokemon.url);
        return (
          <Link
            key={pokemon.name}
            to={`/pokemon/${pokemon.name}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 flex flex-col items-center"
            onClick={() => {
              scrollPosition.current = window.scrollY;
            }}
          >
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
              alt={pokemon.name}
              className="h-24 w-24 object-contain"
              loading="lazy"
            />
            <p className="mt-2 font-medium text-gray-800">
              {capitalize(pokemon.name)}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
