
export type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  brand: string;
  inStock: boolean;
  discount: number;
  category: string;
  image: string;
};

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 29.99,
    rating: 4.5,
    brand: "SoundMax",
    inStock: true,
    discount: 15,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 39.99,
    rating: 4.2,
    brand: "TimePro",
    inStock: true,
    discount: 25,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
  },
  {
    id: "3",
    name: "Everyday Backpack",
    price: 34.99,
    rating: 4.7,
    brand: "UrbanTrail",
    inStock: true,
    discount: 0,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700",
  },
  {
    id: "4",
    name: "Portable Speaker",
    price: 24.99,
    rating: 3.8,
    brand: "SoundMax",
    inStock: false,
    discount: 10,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700",
  },
  {
    id: "5",
    name: "Stylish Sunglasses",
    price: 19.99,
    rating: 4.1,
    brand: "VisionX",
    inStock: false,
    discount: 30,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700",
  },
  {
    id: "6",
    name: "Modern Desk Lamp",
    price: 27.99,
    rating: 3.5,
    brand: "LumiHome",
    inStock: true,
    discount: 5,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700",
  },
  {
    id: "7",
    name: "Travel Bottle",
    price: 14.99,
    rating: 4.0,
    brand: "HydroPeak",
    inStock: true,
    discount: 20,
    category: "Home",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700",
  },
  {
    id: "8",
    name: "Gaming Controller",
    price: 44.99,
    rating: 4.8,
    brand: "GameCore",
    inStock: true,
    discount: 15,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=700",
  },
];
