import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import productsJson from "@/data/products.json";

export interface ProductItem {
  id: string | number;
  name: string;
  description: string;
  price: string;
  image: string;
}

export type ProductsData = {
  brandLogos?: Record<string, string>;
  [key: string]: ProductItem[] | Record<string, string> | undefined;
};

const CONFIG_PATH = "config";
const CONFIG_ID = "products";

export function useProducts(): {
  data: ProductsData | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [productsSnap, configSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDoc(doc(db, CONFIG_PATH, CONFIG_ID)),
        ]);

        if (cancelled) return;

        const brandLogos: Record<string, string> =
          (configSnap.data()?.brandLogos as Record<string, string>) ?? {};

        const rawProducts = productsSnap.docs.map((d) => {
          const x = d.data();
          const brand = (x.brand as string)?.trim() || "Umum";
          return {
            id: d.id,
            name: (x.name as string) ?? "",
            description: (x.description as string) ?? "",
            price: (x.price as string) ?? "Contact for pricing",
            image: (x.image as string) ?? "/placeholder.svg",
            brand,
          };
        });

        if (rawProducts.length === 0) {
          setData(productsJson as ProductsData);
          setLoading(false);
          return;
        }

        const byBrand: Record<string, ProductItem[]> = {};
        rawProducts.forEach((p) => {
          const { brand, ...item } = p;
          if (!byBrand[brand]) byBrand[brand] = [];
          byBrand[brand].push(item as ProductItem);
        });

        setData({
          brandLogos,
          ...byBrand,
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setData(productsJson as ProductsData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
