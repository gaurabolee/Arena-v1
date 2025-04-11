import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={3000} // 3 seconds
      closeButton={false} // Remove close button from notifications
      richColors={false} // Disable rich colors for a simpler look
      expand={false} // Don't expand notifications
      position="bottom-center" // Position at bottom center
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border",
          error: "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border",
          info: "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border",
          warning: "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
