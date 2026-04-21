import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ProductItem {
  id: number;
  name: string;
  description: string;
  price: string;
  discount?: number;
  image: string;
  stock?: number;
  category?: string;
  brand?: string;
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
        const [
          { data: productsData, error: productsError },
          { data: configData, error: configError },
        ] = await Promise.all([
          supabase
            .from("products")
            .select(`
              id,
              name,
              description,
              price,
              discount,
              image,
              stock,
              brands (
                name
              ),
              categories (
                name,
                slug
              )
            `),
          supabase
            .from(CONFIG_PATH)
            .select("id, brandLogos")
            .eq("id", CONFIG_ID)
            .maybeSingle(),
        ]);

console.log("productsData:", productsData); // tambah ini
console.log("productsError:", productsError); // tambah ini

        if (cancelled) return;

        if (productsError) throw productsError;
        if (configError) {
          // config boleh tidak ada; pakai default kosong
          // eslint-disable-next-line no-console
          console.warn("[useProducts] Gagal memuat config brandLogos:", configError.message);
        }

        const brandLogos: Record<string, string> =
          ((configData?.brandLogos as Record<string, string> | undefined) ?? {}) as Record<
            string,
            string
          >;

        const rawProducts =
          productsData?.map((x: any) => {
            const brand =
              ((x.brands?.name as string | undefined) ??
                (x.brand as string | undefined) ??
                "Umum")
                .trim() || "Umum";
            return {
              id: x.id ?? "",
              name: (x.name as string) ?? "",
              description: (x.description as string) ?? "",
              price:
                typeof x.price === "number"
                  ? String(x.price)
                  : ((x.price as string) ?? "Contact for pricing"),
              discount: typeof x.discount === "number" ? x.discount : Number(x.discount) || 0,
              image: (x.image as string) ?? "/placeholder.svg",
              stock: typeof x.stock === "number" ? x.stock : undefined,
              brand,
              category: x.categories?.name || "Other",
            };
          }) ?? [];

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
          setData(null);
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
