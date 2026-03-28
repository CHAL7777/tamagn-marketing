import Image from "next/image";
import {
  GSTATIC_ICONS,
  gstaticMaterialIcon,
} from "@/lib/marketing/gstatic-assets";

type IconKey = keyof typeof GSTATIC_ICONS;

type Props = {
  icon: IconKey;
  alt: string;
  size?: 40 | 48 | 56;
  className?: string;
};

const dim = { 40: 40, 48: 48, 56: 56 } as const;

export function MaterialIconImage({ icon, alt, size = 48, className }: Props) {
  const d = dim[size];
  return (
    <Image
      src={gstaticMaterialIcon(GSTATIC_ICONS[icon])}
      alt={alt}
      width={d}
      height={d}
      className={className}
    />
  );
}
