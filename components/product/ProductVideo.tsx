interface ProductVideoProps {
  url: string;
  title: string;
}

function getYouTubeId(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.slice(1);
    }

    return parsedUrl.searchParams.get("v");
  } catch {
    return null;
  }
}

export default function ProductVideo({
  url,
  title,
}: ProductVideoProps) {
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return null;
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-300 bg-slate-100 shadow-xl">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}