"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Slider({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex h-6 w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/10">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-primary bg-background shadow-glow focus:outline-none focus:ring-2 focus:ring-ring" />
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-primary bg-background shadow-glow focus:outline-none focus:ring-2 focus:ring-ring" />
    </SliderPrimitive.Root>
  );
}
