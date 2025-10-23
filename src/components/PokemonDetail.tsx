import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: { front_default: string };
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

export default function PokemonDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemon = async () => {
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) throw new Error('Pokémon not found');
      const data: PokemonDetail = await res.json();
      setPokemon(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, [name]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const keyStats = useMemo(() => {
    if (!pokemon) return [];
    return pokemon.stats
      .filter((s) => ['hp', 'attack', 'defense'].includes(s.stat.name))
      .map((s) => ({
        name: capitalize(s.stat.name.replace('-', ' ')),
        value: s.base_stat,
      }));
  }, [pokemon]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-600"></div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error || 'Pokémon not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to List
      </button>

      <div className="flex justify-center">
        <img
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          className="w-48 h-48"
          loading="lazy"
        />
      </div>

      <h2 className="text-2xl font-bold text-center capitalize">
        {pokemon.name} <span className="text-gray-500">#{pokemon.id.toString().padStart(3, '0')}</span>
      </h2>

      <div className="grid grid-cols-2 gap-4 mt-4 text-center">
        <div>
          <p className="text-sm text-gray-600">Height</p>
          <p className="font-semibold">{pokemon.height / 10} m</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Weight</p>
          <p className="font-semibold">{pokemon.weight / 10} kg</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Types</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm capitalize"
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Abilities</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {pokemon.abilities.map((a) => (
            <span
              key={a.ability.name}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize"
            >
              {a.ability.name.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Key Stats</h3>
        <div className="space-y-2">
          {keyStats.map((stat) => (
            <div key={stat.name} className="flex justify-between">
              <span className="capitalize">{stat.name}</span>
              <span className="font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}