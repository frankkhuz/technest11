"use client";
import { useEffect, useState } from "react";

export type MediaPreview = { url: string; isVideo: boolean; name: string };

export function useMediaUploads(maxFiles = 10) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<MediaPreview[]>([]);

  // revoke object URLs on unmount to avoid leaking memory
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMediaUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onDone: (count: number) => void
  ) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    const combined = [...mediaFiles, ...incoming].slice(0, maxFiles);
    const newPreviews = incoming
      .slice(0, maxFiles - mediaFiles.length)
      .map((f) => ({
        url: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
        isVideo: f.type.startsWith("video/"),
        name: f.name,
      }));

    setMediaFiles(combined);
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles));
    onDone(combined.length);
    e.target.value = "";
  };

  const removeMedia = (i: number) => {
    const removed = previews[i];
    if (removed?.url) URL.revokeObjectURL(removed.url);
    setMediaFiles((files) => files.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  return { mediaFiles, previews, handleMediaUpload, removeMedia };
}
