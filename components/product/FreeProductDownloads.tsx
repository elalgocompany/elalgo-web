"use client";

import { useState } from "react";

type ProductFile = {
  id: string;
  platform: "mt4" | "mt5";
  version: string | null;
};

type FreeProductDownloadsProps = {
  productId: string;
  files: ProductFile[];
};

export default function FreeProductDownloads({
  productId,
  files,
}: FreeProductDownloadsProps) {
  const [downloadingPlatform, setDownloadingPlatform] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  async function handleDownload(
    platform: string
  ) {
    setDownloadingPlatform(platform);
    setMessage("");

    try {
      const response = await fetch(
        "/api/download/free",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            product_id: productId,
            platform,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not download product."
        );

        return;
      }

      window.location.href =
        data.download_url;

    } catch (error) {
      console.error(
        "Free download error:",
        error
      );

      setMessage(
        "Something went wrong while preparing the download."
      );
    } finally {
      setDownloadingPlatform(null);
    }
  }

  return (
    <div className="mt-8">

      <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
        Free Download
      </p>

      <div className="flex flex-wrap gap-3">
        {files.map((file) => (
          <button
            key={file.id}
            type="button"
            onClick={() =>
              handleDownload(
                file.platform
              )
            }
            disabled={
              downloadingPlatform !== null
            }
            className="flex-1 rounded-xl bg-emerald-500 px-6 py-4 font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingPlatform ===
            file.platform
              ? "Preparing..."
              : `Download ${file.platform.toUpperCase()}`}
          </button>
        ))}
      </div>

      {message && (
        <p className="mt-3 text-sm text-red-500">
          {message}
        </p>
      )}

    </div>
  );
}