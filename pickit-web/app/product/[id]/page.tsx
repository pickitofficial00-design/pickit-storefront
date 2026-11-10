import AddToCartButton from "../../context/AddToCartButton";

export const instant = false;

const products = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 39.99,
    category: "Electronics",
    description:
      "Enjoy clear sound, comfortable ear cushions and wireless listening for everyday use.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 49.99,
    category: "Electronics",
    description:
      "A modern smartwatch for everyday convenience and style.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900",
  },
  {
    id: "3",
    name: "Minimal Backpack",
    price: 34.99,
    category: "Accessories",
    description:
      "A practical backpack with a clean design for daily use.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900",
  },
  {
    id: "4",
    name: "Modern Sunglasses",
    price: 19.99,
    category: "Accessories",
    description:
      "A stylish everyday accessory with a modern frame.",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900",
  },
  {
    id: "5",
    name: "Portable Bluetooth Speaker",
    price: 29.99,
    category: "Electronics",
    description:
      "Compact wireless speaker for music at home or on the go.",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900",
  },
  {
    id: "6",
    name: "Premium Water Bottle",
    price: 14.99,
    category: "Lifestyle",
    description:
      "A reusable bottle designed for everyday hydration.",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900",
  },
  {
    id: "7",
    name: "Desk Lamp",
    price: 24.99,
    category: "Lifestyle",
    description:
      "A modern desk lamp for your workspace.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900",
  },
  {
    id: "8",
    name: "Wireless Earbuds",
    price: 27.99,
    category: "Electronics",
    description:
      "Compact wireless earbuds for everyday listening.",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900",
  },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1>Product not found</h1>
        <a href="/">Back to PICKIT</a>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#171717",
      }}
    >
      <header
        style={{
          padding: "20px 6%",
          borderBottom: "1px solid #eeeeee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a
          href="/"
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: "#f26b21",
          }}
        >
          PICKIT
        </a>
        <a href="/" style={{ fontWeight: 600 }}>
          ← Continue shopping
        </a>
      </header>

      <section
        style={{
          maxWidth: 1100,
          margin: "50px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 45,
          alignItems: "center",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            maxHeight: 480,
            objectFit: "contain",
            background: "#f5f3ef",
            borderRadius: 16,
          }}
        />

        <div>
          <p style={{ color: "#f26b21", fontWeight: 700 }}>
            {product.category}
          </p>

          <h1 style={{ fontSize: 34, lineHeight: 1.2 }}>
            {product.name}
          </h1>

          <p style={{ color: "#777", lineHeight: 1.7 }}>
            {product.description}
          </p>

          <h2 style={{ fontSize: 30 }}>
            ${product.price.toFixed(2)}
          </h2>

          <p style={{ color: "#777", fontSize: 13 }}>
            Price shown is a demonstration price.
          </p>

         <AddToCartButton
  product={{
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
  }}
/>

          <p style={{ marginTop: 20, color: "#777", fontSize: 13 }}>
            PICKIT — Discover. Choose. Enjoy.
          </p>
        </div>
      </section>
    </main>
  );
}