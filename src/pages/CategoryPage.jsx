import { useParams } from "react-router-dom";

function CategoryPage() {
  const { categoryName } = useParams();

  // Example category data (you’ll replace this with real data later)
  const allProducts = [
    {
      id: 1,
      category: "skincare",
      name: "Rose Glow Serum",
      price: "₹2,199",
      image: "https://images.unsplash.com/photo-1612817159949-bd3b34a0c8de?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      category: "makeup",
      name: "Velvet Lipstick",
      price: "₹1,499",
      image: "https://images.unsplash.com/photo-1601049541289-9c70d0d29ec1?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      category: "fragrances",
      name: "Golden Mist Perfume",
      price: "₹3,999",
      image: "https://images.unsplash.com/photo-1585386959984-a4155223f2b9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      category: "haircare",
      name: "Silky Shine Shampoo",
      price: "₹899",
      image: "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?auto=format&fit=crop&w=600&q=80",
    },
  ];

  // Filter products by category name from URL
  const filteredProducts = allProducts.filter(
    (p) => p.category.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <section className="py-16 px-6 md:px-12 bg-white">
      <h2 className="text-4xl font-bold text-center mb-10 text-primary capitalize">
        {categoryName}
      </h2>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-600">
          No products found in this category.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-t-xl"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-primary font-medium mt-1">{product.price}</p>
                <button className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-pink-700 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoryPage;
