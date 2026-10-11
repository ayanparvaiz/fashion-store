import type { Metadata } from "next";
import { ContentPage } from "@/components/pages/content-page";
import { SizeTable } from "@/components/product/size-table";
import { SIZE_TABLES } from "@/lib/size-guide";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Find your perfect fit with the Fashion Store size guide for women and men.",
};

export default function SizeGuidePage() {
  return (
    <ContentPage eyebrow="Find your fit" title="Size guide" intro="All measurements are body measurements in centimetres.">
      <div className="space-y-10">
        {Object.values(SIZE_TABLES).map((table) => (
          <SizeTable key={table.title} table={table} />
        ))}
      </div>
      <h2>How to measure</h2>
      <ul>
        <li><strong>Bust / chest:</strong> measure around the fullest part, keeping the tape level.</li>
        <li><strong>Waist:</strong> measure around your natural waistline, the narrowest part of your torso.</li>
        <li><strong>Hips:</strong> measure around the fullest part of your hips.</li>
        <li><strong>Inseam:</strong> measure from the crotch to the bottom of the ankle.</li>
      </ul>
    </ContentPage>
  );
}
