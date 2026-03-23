"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function PaymentPageContent() {
  const search = useSearchParams();
  const course = search.get("course") ?? "Selected course";
  const [started, setStarted] = useState(false);
  const [method, setMethod] = useState<"card" | "upi">("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const cardValid = useMemo(
    () =>
      cardName.trim().length > 1 &&
      /^\d{16}$/.test(cardNumber.replace(/\s+/g, "")) &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) &&
      /^\d{3,4}$/.test(cvv),
    [cardName, cardNumber, expiry, cvv]
  );
  const upiValid = useMemo(() => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId), [upiId]);
  const canPay = method === "card" ? cardValid : upiValid;

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 pt-6">
      <h1 className="text-2xl font-bold text-white">Complete payment</h1>
      <p className="mt-2 text-sm text-neutral-400">
        You need to pay to unlock this paid course.
      </p>

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900/80 p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Course</p>
        <p className="mt-1 text-base font-semibold text-white">{course}</p>

        {!started ? (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-5 w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-neutral-900"
          >
            Proceed to payment
          </button>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Choose payment method</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    method === "card"
                      ? "border-brand bg-brand/20 text-brand"
                      : "border-neutral-700 text-neutral-300"
                  }`}
                >
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("upi")}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    method === "upi"
                      ? "border-brand bg-brand/20 text-brand"
                      : "border-neutral-700 text-neutral-300"
                  }`}
                >
                  UPI
                </button>
              </div>
            </div>

            {method === "card" ? (
              <div className="space-y-3">
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Cardholder name"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-brand"
                />
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card number (16 digits)"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-brand"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-brand"
                  />
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="CVV"
                    className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-brand"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="UPI ID (example@upi)"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-brand"
                />
                <p className="text-xs text-neutral-500">Required: valid UPI ID</p>
              </div>
            )}

            <button
              type="button"
              disabled={!canPay}
              className="w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Pay now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto min-h-screen w-full max-w-2xl px-4 pt-6 text-white">Loading...</div>}
    >
      <PaymentPageContent />
    </Suspense>
  );
}

