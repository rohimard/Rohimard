"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StepOccasion } from "@/components/configurator/StepOccasion";
import { StepExperience } from "@/components/configurator/StepExperience";
import { StepPersonalize } from "@/components/configurator/StepPersonalize";
import { StepMedia } from "@/components/configurator/StepMedia";
import { StepMusic } from "@/components/configurator/StepMusic";
import { StepDelivery } from "@/components/configurator/StepDelivery";
import { StepSummary } from "@/components/configurator/StepSummary";
import { OrderConfirmation } from "@/components/configurator/OrderConfirmation";
import { STEP_TITLES, TOTAL_STEPS } from "@/components/configurator/steps";
import { createOrder, type CreateOrderResult } from "@/lib/actions/orders";
import type { ConfiguratorState, Occasion, ProductSlug } from "@/lib/types";

const EMPTY_STATE: ConfiguratorState = {
  occasion: null,
  productSlug: null,
  recipientName: "",
  senderName: "",
  specialDate: "",
  message: "",
  letter: "",
  specialPhrase: "",
  mediaFiles: [],
  musicOption: "sin_musica",
  musicValue: "",
  delivery: {
    contactName: "",
    phone: "",
    district: "",
    address: "",
    reference: "",
    deliveryDate: "",
    deliveryTime: "",
  },
};

export function ConfiguratorShell({
  initialProduct,
  initialOccasion,
}: {
  initialProduct?: ProductSlug;
  initialOccasion?: Occasion;
}) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<ConfiguratorState>({
    ...EMPTY_STATE,
    productSlug: initialProduct ?? null,
    occasion: initialOccasion ?? null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateOrderResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  function updateDelivery<K extends keyof ConfiguratorState["delivery"]>(key: K, value: ConfiguratorState["delivery"][K]) {
    setState((s) => ({ ...s, delivery: { ...s.delivery, [key]: value } }));
  }

  function isStepValid() {
    switch (step) {
      case 0:
        return Boolean(state.occasion);
      case 1:
        return Boolean(state.productSlug);
      case 2:
        return state.recipientName.trim().length > 1 && state.senderName.trim().length > 1;
      case 3:
        return true;
      case 4:
        return state.musicOption === "sin_musica" || state.musicValue.trim().length > 0;
      case 5:
        return (
          state.delivery.contactName.trim().length > 1 &&
          state.delivery.phone.trim().length > 5 &&
          state.delivery.district.trim().length > 0 &&
          state.delivery.address.trim().length > 3
        );
      default:
        return true;
    }
  }

  function goNext() {
    if (!isStepValid()) {
      setFormError("Completa los campos requeridos para continuar.");
      return;
    }
    setFormError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setFormError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFormError(null);
    const res = await createOrder({
      occasion: state.occasion!,
      productSlug: state.productSlug!,
      recipientName: state.recipientName,
      senderName: state.senderName,
      specialDate: state.specialDate,
      message: state.message,
      letter: state.letter,
      specialPhrase: state.specialPhrase,
      mediaPaths: state.mediaFiles.map((f) => f.path),
      musicOption: state.musicOption,
      musicValue: state.musicValue,
      delivery: state.delivery,
    });
    setSubmitting(false);

    if (!res.success) {
      setFormError(res.error ?? "Ocurrió un error, inténtalo de nuevo.");
      return;
    }
    setResult(res);
  }

  if (result) {
    return <OrderConfirmation result={result} />;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink/50">
          <span>
            Paso {step + 1} de {TOTAL_STEPS} · {STEP_TITLES[step]}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="card-premium p-6 sm:p-10">
        {step === 0 && <StepOccasion value={state.occasion} onChange={(v) => setState((s) => ({ ...s, occasion: v }))} />}
        {step === 1 && (
          <StepExperience value={state.productSlug} onChange={(v) => setState((s) => ({ ...s, productSlug: v }))} />
        )}
        {step === 2 && (
          <StepPersonalize
            values={state}
            onChange={(key, value) => setState((s) => ({ ...s, [key]: value }))}
          />
        )}
        {step === 3 && (
          <StepMedia
            sessionId={sessionId}
            files={state.mediaFiles}
            onChange={(files) => setState((s) => ({ ...s, mediaFiles: files }))}
          />
        )}
        {step === 4 && (
          <StepMusic
            option={state.musicOption}
            value={state.musicValue}
            onOptionChange={(v) => setState((s) => ({ ...s, musicOption: v }))}
            onValueChange={(v) => setState((s) => ({ ...s, musicValue: v }))}
          />
        )}
        {step === 5 && <StepDelivery values={state.delivery} onChange={updateDelivery} />}
        {step === 6 && <StepSummary state={state} submitting={submitting} onSubmit={handleSubmit} />}

        {formError && <p className="mt-6 text-sm font-medium text-rubi-600">{formError}</p>}

        {step < TOTAL_STEPS - 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-ink/5 pt-6">
            <Button variant="ghost" onClick={goBack} disabled={step === 0} className={step === 0 ? "invisible" : ""}>
              <ChevronLeft className="h-4 w-4" /> Atrás
            </Button>
            <Button onClick={goNext}>
              Continuar <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {step === TOTAL_STEPS - 1 && (
          <div className="mt-10 flex items-center justify-start border-t border-ink/5 pt-6">
            <Button variant="ghost" onClick={goBack}>
              <ChevronLeft className="h-4 w-4" /> Atrás
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
