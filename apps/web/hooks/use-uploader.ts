import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
type EndPoint = "articleImagePreview" | "imageUploader";

export interface Attachment {
  file: File;
  url?: string;
  size?: number;
  isUploading: boolean;
  type?: string;
}

export default function useUploader(endpoint: EndPoint) {
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number>();
  const [url, setUrl] = useState<string | null>(null);

  const router = useRouter();

  const { startUpload, isUploading, routeConfig } = useUploadThing(endpoint, {
    onBeforeUploadBegin(files) {
      const file = files[0];
      if (!file) return files;

      const extension = file.name.split(".").pop() || "";
      const renamedFile = new File(
        [file],
        `file_${crypto.randomUUID()}.${extension}`,
        {
          type: file.type,
        }
      );

      setAttachment({ file: renamedFile, isUploading: true });

      return [renamedFile];
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      if (res && res.length > 0) {
        const uploadResult = res[0];
        setAttachment((prev) =>
          prev && uploadResult
            ? {
                ...prev,
                url: uploadResult.ufsUrl,
                isUploading: false,
                size: uploadResult.size,
                type: uploadResult.type.split("/")[1],
              }
            : null
        );
        setUrl(uploadResult?.ufsUrl || null);
      }
      router.refresh();
    },
    onUploadError(e) {
      setAttachment(null);
      toast.error("Upload failed");
    },
  });

  async function removeAttachment() {
    if (!attachment || !attachment.url) return;

    const key = attachment.url.split("/f/")[1];

    const res = await fetch("/api/remove", {
      method: "POST",
      body: JSON.stringify({ key }),
    });

    if (res.ok) {
      setAttachment(null);
      setUrl(null);
    }
  }

  function reset() {
    setAttachment(null);
    setUploadProgress(undefined);
    setUrl(null);
  }

  return {
    startUpload,
    attachment,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset,
    routeConfig,
    url,
  };
}
