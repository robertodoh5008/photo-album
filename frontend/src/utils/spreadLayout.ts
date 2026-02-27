import { MediaItem, Spread, SpreadLayout } from "@/types";

const LAYOUTS: SpreadLayout[] = ["hero-two", "two-equal", "hero-one"];

export function createSpreads(media: MediaItem[]): Spread[] {
  if (media.length === 0) return [];

  const spreads: Spread[] = [];
  let i = 0;
  let layoutIdx = 0;

  while (i < media.length) {
    const remaining = media.length - i;

    if (remaining >= 3 && LAYOUTS[layoutIdx % LAYOUTS.length] === "hero-two") {
      spreads.push({
        media: media.slice(i, i + 3),
        layout: "hero-two",
      });
      i += 3;
    } else if (remaining >= 2) {
      const layout = remaining === 2 && layoutIdx % 2 === 0 ? "two-equal" : "hero-one";
      spreads.push({
        media: media.slice(i, i + 2),
        layout,
      });
      i += 2;
    } else {
      spreads.push({
        media: media.slice(i, i + 1),
        layout: "hero-one",
      });
      i += 1;
    }

    layoutIdx++;
  }

  return spreads;
}
