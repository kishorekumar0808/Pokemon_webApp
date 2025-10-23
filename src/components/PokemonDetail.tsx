import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Ability {
  ability: { name: string };
  is_hidden: boolean;
}
interface Type {
  type: { name: string };
}
interface Stat {
  base_stat: number;
  stat: { name: string };
}
interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other?: {
      "official-artwork"?: {
        front_default: string;
      };
    };
  };
  abilities: Ability[];
  types: Type[];
  stats: Stat[];
}

const formatStatName = (s: string) =>
  s.replace("-", " ").replace("special", "Sp.");

const statColors: Record<string, string> = {
  hp: "#ef5350",
  attack: "#fb8c00",
  defense: "#ffca28",
  "special-attack": "#42a5f5",
  "special-defense": "#66bb6a",
  speed: "#ec407a",
};

export default function PokemonDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getArtwork = () => {
    return (
      pokemon?.sprites.other?.["official-artwork"]?.front_default ||
      pokemon?.sprites.front_default ||
      ""
    );
  };

  useEffect(() => {
    const fetchPokemon = async () => {
      if (!name) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!res.ok) throw new Error("Pokémon not found");
        const data: PokemonDetail = await res.json();
        setPokemon(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchPokemon();
  }, [name]);

  const stats = useMemo(() => {
    if (!pokemon) return [];
    return pokemon.stats.map((s) => ({
      name: formatStatName(s.stat.name),
      value: s.base_stat,
      key: s.stat.name,
    }));
  }, [pokemon]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-red-600"></div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error || "Pokémon not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg md:p-8">
      {/* ----- Header ----- */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold capitalize">
          {pokemon.name}
          <span className="ml-2 text-xl font-normal text-gray-500">
            #{pokemon.id.toString().padStart(3, "0")}
          </span>
        </h1>

        {/* ----- Abilities ----- */}
        <div className="flex flex-col items-end">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-700">
            Abilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {pokemon.abilities.map((a) => (
              <span
                key={a.ability.name}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  a.is_hidden
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {a.ability.name.replace("-", " ")}
                {a.is_hidden && " (Hidden) "}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* ----- Left column – sprite + types/height/weight ----- */}
        <div className="flex flex-col items-center">
          <div className="rounded-xl bg-gray-50 p-6">
            <img
              src={getArtwork()}
              alt={pokemon.name}
              className="h-64 w-64 object-contain official-art"
              loading="lazy"
            />
          </div>

          {/* Types */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700">Type</span>
            {pokemon.types.map((t) => (
              <span
                key={t.type.name}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  t.type.name === "grass"
                    ? "bg-green-200 text-green-800"
                    : t.type.name === "poison"
                    ? "bg-purple-200 text-purple-800"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {t.type.name}
              </span>
            ))}
          </div>

          {/* Height / Weight */}
          <div className="mt-4 flex w-full justify-around text-center">
            <div>
              <p className="text-sm text-gray-600">Height</p>
              <p className="font-semibold">{pokemon.height / 10} m</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Weight</p>
              <p className="font-semibold">{pokemon.weight / 10} kg</p>
            </div>
          </div>
        </div>

        {/* ----- Right column – Base Stats ----- */}
        <div className="flex flex-col">
          <h2 className="mb-3 text-lg font-semibold uppercase tracking-wider text-gray-700">
            Base Stats
          </h2>

          <div className="space-y-3">
            {stats.map((s) => {
              const percent = (s.value / 255) * 100;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-20 text-sm font-medium capitalize">
                    {s.name}
                  </span>
                  <div className="flex-1">
                    <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: statColors[s.key] || "#9e9e9e",
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-medium">
                    {s.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ----- Back button ----- */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(-1)}
          className="rounded bg-gray-600 px-5 py-2 text-white hover:bg-gray-700"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}
