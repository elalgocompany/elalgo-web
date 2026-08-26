import { supabase } from "./supabase";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}



export async function getProductImages(productId: string) {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}



export async function getProductPlans(
  productId: string
) {
  const { data, error } = await supabase
    .from("product_plans")
    .select("*")
    .eq("product_id", productId)
    .order("price", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getProductPlan(planId: string) {
  const { data, error } = await supabase
    .from("product_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (error) {
    console.error("Error loading product plan:", error);
    return null;
  }

  return data;
}

export async function getProductById(productId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    console.error("Error loading product:", error);
    return null;
  }

  return data;
}




export async function getProductFiles(productId: string) {
  const { data, error } = await supabase
    .from("product_files")
    .select(`
      id,
      platform,
      version
    `)
    .eq("product_id", productId);

  if (error) {
    console.error("Error loading product files:", error);
    throw new Error(error.message);
  }

  console.log("PRODUCT FILES FROM SUPABASE:", data);

  return data ?? [];
}