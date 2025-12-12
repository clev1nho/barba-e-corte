import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

export function useGalleryImages() {
  return useQuery({
    queryKey: ["gallery_images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data as GalleryImage[];
    },
  });
}
