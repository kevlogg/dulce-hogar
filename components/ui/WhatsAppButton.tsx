"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { isWhatsAppConfigured, whatsappUrl, messageGeneral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils/cn";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "floating" | "inline";
}

/**
 * Botón flotante global (variant="floating") o inline para usar en secciones.
 */
export function WhatsAppButton({
  message = messageGeneral(),
  className,
  children,
  variant = "floating",
}: WhatsAppButtonProps) {
  const href = whatsappUrl(message);

  if (!isWhatsAppConfigured() || href === "#") {
    return null;
  }

  if (variant === "floating") {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:bg-[#20BD5A] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2",
          className
        )}
        aria-label="Abrir WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </Link>
  );
}
