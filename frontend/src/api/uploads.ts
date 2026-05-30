import { apiClient } from "./client";

export const uploadProductImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  return apiClient.post<string[]>("/uploads/products/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
