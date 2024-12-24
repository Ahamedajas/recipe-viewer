"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { StarIcon } from "@heroicons/react/24/solid";

interface Recipe {
  idMeal: string;
  strMeal: string;
  strInstructions: string;
  strMealThumb: string;
  strIngredient1: string;
  strIngredient2: string;
  strIngredient3: string;
  strIngredient4: string;
  strIngredient5: string;
}

export default function RecipeDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then((res) => res.json())
        .then((data) => setRecipe(data.meals ? data.meals[0] : null));
    }
  }, [id]);

  useEffect(() => {
    if (recipe) {
      fetch(`/api/favorites`)
        .then((res) => res.json())
        .then((data) => {
          const isFavoriteRecipe = data.some((fav: any) => fav.recipeId === recipe.idMeal);
          setIsFavorite(isFavoriteRecipe);
        });
    }
  }, [recipe]);

  const handleFavorite = async () => {
    if (isFavorite) {
      // Remove from favorites
      try {
        await axios.delete(`/api/favorites`, {
          data: { recipeId: recipe?.idMeal },
        });
        setIsFavorite(false);
        setMessage("Removed from favorites!");
        setTimeout(() => setMessage(""), 3000); // Hide the message after 3 seconds
      } catch (error) {
        setMessage("Failed to remove from favorites.");
        setTimeout(() => setMessage(""), 3000);
      }
    } else {
      // Add to favorites
      try {
        await axios.post("/api/favorites", {
          recipeId: recipe?.idMeal,
          recipeName: recipe?.strMeal,
          imageUrl: recipe?.strMealThumb,
        });
        setIsFavorite(true);
        setMessage(`${recipe?.strMeal} has been added to favorites!`);
        setTimeout(() => setMessage(""), 3000); // Hide the message after 3 seconds
      } catch (error) {
        setMessage("Failed to add recipe to favorites.");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  if (!recipe) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <main className="min-h-screen p-10 bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center">{recipe.strMeal}</h1>
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-[350px] object-cover rounded-lg mb-8 shadow-md"
        />
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold mb-4">Instructions</h2>
          <p className="leading-relaxed text-lg">{recipe.strInstructions}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
          <h2 className="text-3xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc pl-6">
            {Object.keys(recipe)
              .filter((key) => key.startsWith("strIngredient") && recipe[key as keyof Recipe])
              .map((key, index) => (
                <li key={index} className="text-lg text-gray-400">
                  {recipe[key as keyof Recipe]} - {recipe[`strMeasure${index + 1}` as keyof Recipe]}
                </li>
              ))}
          </ul>
        </div>
        <button
          onClick={handleFavorite}
          className="mt-4 p-4 bg-yellow-500 rounded-full hover:bg-yellow-600 transition"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <StarIcon
            className={`w-8 h-8 ${isFavorite ? 'text-yellow-400' : 'text-gray-400'}`}
          />
        </button>

        {message && (
          <div className="mt-4 p-4 bg-green-500 text-white rounded-lg">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}