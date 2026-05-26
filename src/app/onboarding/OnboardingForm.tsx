"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Divider } from "@/components/ui/Divider";
import { ProgressRail } from "@/components/onboarding/ProgressRail";
import {
  GEO_OPTIONS,
  ORG_TYPE_OPTIONS,
  PARTNERSHIP_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  STAGE_OPTIONS,
} from "@/lib/profile/enums";
import {
  submitOnboardingAction,
  type OnboardingFormState,
} from "./actions";

const initialState: OnboardingFormState = {};

const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "exchange", label: "Exchange" },
  { id: "private", label: "Private" },
];

export function OnboardingForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    submitOnboardingAction,
    initialState,
  );
  const [timezone, setTimezone] = useState<string>("UTC");

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      // ignore
    }
  }, []);

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="timezone" value={timezone} />

      <ProgressRail sections={SECTIONS} />

      <section className="space-y-6" data-section="work">
        <SectionHeading
          eyebrow="What you do"
          title="The work you bring."
          description="This is what other members will see, paired with your alias."
        />

        <Label htmlFor="mission_statement" hint="2–4 sentences">
          Mission statement
          <Textarea
            id="mission_statement"
            name="mission_statement"
            rows={4}
            required
            minLength={30}
            placeholder="We help under-resourced clinics deliver preventive care to women over 50."
            aria-invalid={state.field === "mission_statement"}
          />
        </Label>

        <div className="grid gap-5 sm:grid-cols-2">
          <Label htmlFor="sector">
            Sector
            <Select id="sector" name="sector" required defaultValue="">
              <option value="" disabled>
                Pick one…
              </option>
              {SECTOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Label>
          <Label htmlFor="org_type">
            Organisation type
            <Select id="org_type" name="org_type" required defaultValue="">
              <option value="" disabled>
                Pick one…
              </option>
              {ORG_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Label>
          <Label htmlFor="stage">
            Stage
            <Select id="stage" name="stage" required defaultValue="">
              <option value="" disabled>
                Pick one…
              </option>
              {STAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Label>
          <Label htmlFor="geographic_reach">
            Geographic reach
            <Select
              id="geographic_reach"
              name="geographic_reach"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Pick one…
              </option>
              {GEO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Label>
        </div>

        <Label htmlFor="region" hint="Optional — city, state, or country">
          Region
          <Input id="region" name="region" placeholder="Indianapolis, IN" />
        </Label>

        <Label htmlFor="impact_statement" hint="Optional">
          Impact statement
          <Textarea
            id="impact_statement"
            name="impact_statement"
            rows={3}
            placeholder="A sentence on the change you create when the work goes well."
          />
        </Label>
      </section>

      <Divider />

      <section className="space-y-6" data-section="exchange">
        <SectionHeading
          eyebrow="The exchange"
          title="What you bring, what you need."
          description="Concrete is better than aspirational. This is what gets matched against."
        />

        <Label htmlFor="what_we_offer">
          What you offer
          <Textarea
            id="what_we_offer"
            name="what_we_offer"
            rows={3}
            required
            placeholder="Vendor relationships, board advisory, distribution to clinics in the Midwest."
          />
        </Label>

        <Label htmlFor="what_we_need">
          What you need
          <Textarea
            id="what_we_need"
            name="what_we_need"
            rows={3}
            required
            placeholder="Funder intros, programme co-design partners, regulatory help."
          />
        </Label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-ink">
            Partnership types you are open to
          </legend>
          <p className="text-xs text-muted">Pick all that apply.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PARTNERSHIP_TYPE_OPTIONS.map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-border bg-white p-3 transition-colors duration-200 hover:border-primary/40 has-checked:border-primary has-checked:bg-primary-bg/40"
              >
                <input
                  type="checkbox"
                  name="partnership_types"
                  value={o.value}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {o.label}
                  </span>
                  <span className="block text-xs text-muted">
                    {o.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <Divider />

      <section className="space-y-6" data-section="private">
        <SectionHeading
          eyebrow="Private — never shown to other members"
          title="Who you actually are."
          description="Only revealed at the meeting itself. We use these to send your intro email and confirm the booking."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Label htmlFor="full_name">
            Full name
            <Input
              id="full_name"
              name="full_name"
              required
              autoComplete="name"
            />
          </Label>
          <Label htmlFor="org_name">
            Organisation name
            <Input id="org_name" name="org_name" required />
          </Label>
        </div>

        <Label htmlFor="personal_email">
          Email
          <Input
            id="personal_email"
            name="personal_email"
            type="email"
            required
            defaultValue={email}
            autoComplete="email"
          />
        </Label>

        <Label htmlFor="website" hint="Optional">
          Website
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://"
          />
        </Label>
      </section>

      <FieldError message={state.error} />

      <Button type="submit" loading={pending} size="lg" fullWidth>
        Generate my alias
      </Button>

      <p className="text-center text-xs text-muted">
        Your alias is permanent. You'll see it on the next screen.
      </p>
    </form>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display text-2xl text-ink md:text-3xl">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
