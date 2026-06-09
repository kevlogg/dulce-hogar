import { SITE_NAME } from "@/lib/site-config";

const MP_API = "https://api.mercadopago.com";

function mpToken() {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new Error("MP_ACCESS_TOKEN no configurado");
  return t;
}

export async function obtenerOCrearCustomer(email: string): Promise<string> {
  const token = mpToken();
  const searchRes = await fetch(
    `${MP_API}/v1/customers/search?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!searchRes.ok && searchRes.status !== 404) {
    const err = await searchRes.text();
    throw new Error(`Error buscando customer MP: ${err}`);
  }
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.results?.length > 0) return data.results[0].id as string;
  }
  const createRes = await fetch(`${MP_API}/v1/customers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Error creando customer MP: ${err}`);
  }
  const created = await createRes.json();
  return created.id as string;
}

export async function asociarTarjeta(
  customerId: string,
  cardToken: string
): Promise<{ card_id: string; last_four: string; brand: string }> {
  const token = mpToken();
  const res = await fetch(`${MP_API}/v1/customers/${customerId}/cards`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ token: cardToken }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error asociando tarjeta: ${err}`);
  }
  const card = await res.json();
  return {
    card_id: card.id as string,
    last_four: card.last_four_digits as string,
    brand: (card.payment_method?.id as string) ?? "",
  };
}

export async function cobrarTarjeta(params: {
  customerId: string;
  cardId: string;
  amount: number;
  email: string;
  paymentMethodId: string;
  installments?: number;
  description?: string;
}): Promise<{ payment_id: string; status: string }> {
  const token = mpToken();
  const key = `cobro-${params.cardId}-${Date.now()}`;

  const tokenRes = await fetch(`${MP_API}/v1/card_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `${key}-token`,
    },
    body: JSON.stringify({ customer_id: params.customerId, card_id: params.cardId }),
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Error generando token de cobro: ${err}`);
  }
  const { id: chargeToken } = await tokenRes.json();

  const payRes = await fetch(`${MP_API}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `${key}-pay`,
    },
    body: JSON.stringify({
      transaction_amount: params.amount,
      token: chargeToken,
      description: params.description ?? "Plan mensual",
      installments: params.installments ?? 1,
      payment_method_id: params.paymentMethodId,
      payer: { email: params.email },
      statement_descriptor: SITE_NAME,
    }),
  });
  if (!payRes.ok) {
    const err = await payRes.text();
    throw new Error(`Error en el cobro: ${err}`);
  }
  const pay = await payRes.json();
  return { payment_id: String(pay.id), status: pay.status as string };
}
