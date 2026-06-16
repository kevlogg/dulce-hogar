'use client'

import * as Dialog from '@radix-ui/react-dialog'
import dynamic from 'next/dynamic'
import { X } from 'lucide-react'

const CardPaymentForm = dynamic(() => import('./CardPaymentForm'), { ssr: false })

interface CardPaymentModalProps {
  open: boolean
  amount: number
  onClose: () => void
  onSuccess: (data: { cardLastFour: string; cardBrand: string; pending?: boolean }) => void
}

export function CardPaymentModal({ open, amount, onClose, onSuccess }: CardPaymentModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
          <Dialog.Content className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl focus:outline-none">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="font-serif text-lg font-medium text-wood-900">
                Pagar con tarjeta
              </Dialog.Title>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardPaymentForm
              amount={amount}
              onSuccess={onSuccess}
              onError={(msg) => alert(msg)}
              onCancel={onClose}
            />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
