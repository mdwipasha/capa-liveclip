import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";

export function PreviewCard({ imageUrl }: { imageUrl: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/30">
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="(min-width: 768px) 40vw, 100vw" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-sm text-muted-foreground">
            Export preview frame
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
