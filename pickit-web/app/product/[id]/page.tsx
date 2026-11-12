
import AddToCartButton from "../../context/AddToCartButton";
import { products } from "../../products";

export const instant = false;

const descriptions: Record<string, string> = {
  "1": "Enjoy clear sound, comfortable ear cushions and wireless listening for everyday use.",
  "2": "A modern smartwatch for everyday convenience and style.",
  "3": "A practical backpack with a clean design for daily use.",
  "4": "A stylish everyday accessory with a modern frame.",
  "5": "Compact wireless speaker for music at home or on the go.",
  "6": "A reusable bottle designed for everyday hydration.",
  "7": "A modern desk lamp for your workspace.",
  "8": "Compact wireless earbuds for everyday listening.",
};

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
            {descriptions[product.id] ?? "Discover this product at PICKIT."}
          </p>

          <h2 style={{ fontSize: 30 }}>
            ${product.price.toFixed(2)}
          </h2>

          <p style={{ color: "#777", fontSize: 13 }}>
            Price shown is a demonstration price.
          </p>

          <p
            style={{
              color: product.inStock ? "#16803c" : "#dc2626",
              fontWeight: 700,
              margin: "15px 0",
            }}
          >
            {product.inStock ? "● In Stock" : "● Out of Stock"}
          </p>

          {product.inStock ? (
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
              }}
            />
          ) : (
            <button
              disabled
              style={{
                padding: "13px 24px",
                background: "#cccccc",
                color: "#666666",
                border: "none",
                borderRadius: 6,
                cursor: "not-allowed",
                fontWeight: 700,
              }}
            >
              Currently Unavailable
            </button>
          )}

          <p style={{ marginTop: 20, color: "#777", fontSize: 13 }}>
            PICKIT — Discover. Choose. Enjoy.
          </p>
        </div>
      </section>
    </main>
  );
}
