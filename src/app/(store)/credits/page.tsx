import type { Metadata } from "next";
import mediaJson from "@/data/media.json";
import { ContentPage } from "@/components/pages/content-page";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Photography used on this demo store is from Unsplash.",
};

type Photo = { author: string; authorUrl: string; pageUrl: string };

export default function CreditsPage() {
  const photos = Object.values(mediaJson.photos as Record<string, Photo>);
  const authors = [...new Map(photos.map((p) => [p.authorUrl, p])).values()].sort((a, b) =>
    a.author.localeCompare(b.author),
  );
  return (
    <ContentPage
      title="Photo credits"
      intro={
        <>
          Product and campaign photography on this demo store is from{" "}
          <a href="https://unsplash.com/?utm_source=fashion_store&utm_medium=referral" className="underline">
            Unsplash
          </a>
          . Thank you to these photographers.
        </>
      }
    >
      <ul className="columns-1 gap-8 sm:columns-2 [&_li]:ml-0 [&_li]:list-none">
        {authors.map((p) => (
          <li key={p.authorUrl} className="break-inside-avoid py-1">
            <a href={`${p.authorUrl}?utm_source=fashion_store&utm_medium=referral`} target="_blank" rel="noreferrer">
              {p.author}
            </a>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
