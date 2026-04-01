import { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "ai-edited-images";

export interface EditedImage {
  id: string;
  user_id: string;
  image_url: string;
  storage_path: string;
  prompt: string;
  mode: string;
  original_image_url?: string;
  created_at: string;
}

export async function uploadEditedImage(
  supabase: SupabaseClient,
  userId: string,
  imageBase64: string,
  metadata: {
    prompt: string;
    mode: string;
    originalImageUrl?: string;
  },
): Promise<EditedImage> {
  const timestamp = Date.now();
  const filename = `${userId}/${timestamp}-edited.png`;

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, buffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);

  const { data: imageRecord, error: dbError } = await supabase
    .from("ai_edited_images")
    .insert({
      user_id: userId,
      image_url: publicUrl,
      storage_path: filename,
      prompt: metadata.prompt || "",
      mode: metadata.mode,
      original_image_url: metadata.originalImageUrl,
    })
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from(BUCKET_NAME).remove([filename]);
    throw new Error(`Failed to save image record: ${dbError.message}`);
  }

  return imageRecord as EditedImage;
}

export async function getEditedImages(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
  offset = 0,
  search?: string,
): Promise<{ images: EditedImage[]; total: number }> {
  let countQuery = supabase
    .from("ai_edited_images")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  let dataQuery = supabase
    .from("ai_edited_images")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    countQuery = countQuery.ilike("prompt", `%${search}%`);
    dataQuery = dataQuery.ilike("prompt", `%${search}%`);
  }

  const { count } = await countQuery;
  const { data, error } = await dataQuery;

  if (error) {
    throw new Error(`Failed to fetch images: ${error.message}`);
  }

  return {
    images: (data || []) as EditedImage[],
    total: count || 0,
  };
}

export async function deleteEditedImage(
  supabase: SupabaseClient,
  userId: string,
  imageId: string,
): Promise<void> {
  const { data: image, error: fetchError } = await supabase
    .from("ai_edited_images")
    .select("storage_path")
    .eq("id", imageId)
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    throw new Error("Image not found");
  }

  await supabase.storage.from(BUCKET_NAME).remove([image.storage_path]);

  const { error: dbError } = await supabase
    .from("ai_edited_images")
    .delete()
    .eq("id", imageId)
    .eq("user_id", userId);

  if (dbError) {
    throw new Error(`Failed to delete image: ${dbError.message}`);
  }
}

export async function deleteMultipleEditedImages(
  supabase: SupabaseClient,
  userId: string,
  imageIds: string[],
): Promise<void> {
  if (!imageIds.length) return;

  const { data: images, error: fetchError } = await supabase
    .from("ai_edited_images")
    .select("id, storage_path")
    .in("id", imageIds)
    .eq("user_id", userId);

  if (fetchError) throw new Error("Failed to fetch images for deletion");
  if (!images?.length) return;

  const paths = images.map((img: { storage_path: string }) => img.storage_path);
  await supabase.storage.from(BUCKET_NAME).remove(paths);

  const { error: dbError } = await supabase
    .from("ai_edited_images")
    .delete()
    .in("id", imageIds)
    .eq("user_id", userId);

  if (dbError) {
    throw new Error(`Failed to delete images: ${dbError.message}`);
  }
}
