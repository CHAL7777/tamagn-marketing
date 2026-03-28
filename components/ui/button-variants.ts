import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[1.25rem] font-semibold tracking-tight transition-all duration-200 outline-none select-none focus-visible:ring-4 focus-visible:ring-primary/15 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "signature-gradient text-on-primary shadow-[0_22px_46px_rgba(1,110,0,0.18)] hover:-translate-y-0.5 hover:shadow-[0_28px_54px_rgba(1,110,0,0.24)]",
        outline:
          "bg-surface-container-lowest text-foreground shadow-[0_18px_40px_rgba(26,28,28,0.06)] hover:bg-surface-container-highest hover:-translate-y-0.5",
        secondary:
          "bg-secondary-container text-foreground hover:bg-surface-container-high",
        ghost:
          "bg-transparent text-secondary shadow-none hover:bg-surface-container-lowest hover:text-foreground",
        destructive:
          "bg-error-container text-destructive shadow-[0_18px_40px_rgba(186,26,26,0.08)] hover:bg-[#ffc9c4]",
        link: "rounded-none px-0 py-0 text-primary shadow-none hover:text-primary/80",
      },
      size: {
        default:
          "h-11 px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 rounded-xl px-3 text-xs",
        sm: "h-9 rounded-[1rem] px-4 text-[0.82rem]",
        lg: "h-14 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-11 rounded-[1.25rem]",
        "icon-xs":
          "size-7 rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-[1rem]",
        "icon-lg": "size-14 rounded-[1.25rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
