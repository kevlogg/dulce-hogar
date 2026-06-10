import { Suspense } from "react";
import { ConfirmacionContent } from "./ConfirmacionContent";

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
