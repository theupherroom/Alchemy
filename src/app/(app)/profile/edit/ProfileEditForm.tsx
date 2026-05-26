"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Divider } from "@/components/ui/Divider";
import {
  GEO_OPTIONS,
  ORG_TYPE_OPTIONS,
  PARTNERSHIP_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  STAGE_OPTIONS,
} from "@/lib/profile/enums";
import type {
  ProfileGeoReach,
  ProfileOrgType,
  ProfilePartnershipType,
  ProfileSector,
  ProfileStage,
} from "@/types/database";
import {
  updateProfileAction,
  type EditProfileFormState,
} from "./actions";

type Defaults = {
  mission_statement: string;
  sector: ProfileSector;
  org_type: ProfileOrgType;
  stage: ProfileStage;
  partnership_types: ProfilePartnershipType[];
  what_we_offer: string;
  what_we_need: string;
  geographic_reach: ProfileGeoReach;
  region: string;
  impact_statement: string;
  full_name: string;
  org_name: string;
  personal_email: string;
  website: string;
};

const initialState: EditProfileFormState = {};

export function ProfileEditForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-10">
      <section className="space-y-6">
        <SectionHeading
          eyebrow="What you do"
          title="The work you bring."
          description="Visible to other members alongside your alias."
        />

        <Label htmlFor="mission_statement" hint="2–4 sentences">
          Mission statement
          <Textarea
            id="mission_statement"
            name="mission_statement"
            rows={4}
            required
            minLength={30}
            defaultValue={defaults.mission_statement}
          />
        </Label>

        <div className="grid gap-5 sm:grid-cols-2">
          <Label htmlFor="sector">
            Sector
            <Select id="sector" name="sector" required defaultValue={defaults.sector}>
              {SECTOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Label>
          <Label htmlFor="org_type">
            Organisation type
            <Select
              id="org_type"
              name="org_type"
              required
              defaultValue={defaults.org_type}
            >
              {ORG_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Label>
          <Label htmlFor="stage">
            Stage
            <Select id="stage" name="stage" required defaultValue={defaults.stage}>
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
              defaultValue={defaults.geographic_reach}
            >
              {GEO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Label>
        </div>

        <Label htmlFor="region" hint="Optional">
          Region
          <Input id="region" name="region" defaultValue={defaults.region} />
        </Label>

        <Label htmlFor="impact_statement" hint="Optional">
          Impact statement
          <Textarea
            id="impact_statement"
            name="impact_statement"
            rows={3}
            defaultValue={defaults.impact_statement}
          />
        </Label>
      </section>

      <Divider />

      <section className="space-y-6">
        <SectionHeading
          eyebrow="The exchange"
          title="What you bring, what you need."
          description="Concrete is better than aspirational."
        />

        <Label htmlFor="what_we_offer">
          What you offer
          <Textarea
            id="what_we_offer"
            name="what_we_offer"
            rows={3}
            required
            defaultValue={defaults.what_we_offer}
          />
        </Label>

        <Label htmlFor="what_we_need">
          What you need
          <Textarea
            id="what_we_need"
            name="what_we_need"
            rows={3}
            required
            defaultValue={defaults.what_we_need}
          />
        </Label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-ink">
            Partnership types
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PARTNERSHIP_TYPE_OPTIONS.map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-border bg-white p-3 transition-colors duration-200 hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary-bg/40"
              >
                <input
                  type="checkbox"
                  name="partnership_types"
                  value={o.value}
                  defaultChecked={defaults.partnership_types.includes(o.value)}
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

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Private"
          title="Who you actually are."
          description="Never shown to other members — only revealed at the meeting itself."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Label htmlFor="full_name">
            Full name
            <Input
              id="full_name"
              name="full_name"
              required
              autoComplete="name"
              defaultValue={defaults.full_name}
            />
          </Label>
          <Label htmlFor="org_name">
            Organisation name
            <Input
              id="org_name"
              name="org_name"
              required
              defaultValue={defaults.org_name}
            />
          </Label>
        </div>

        <Label htmlFor="personal_email">
          Email
          <Input
            id="personal_email"
            name="personal_email"
            type="email"
            required
            defaultValue={defaults.personal_email}
            autoComplete="email"
          />
        </Label>

        <Label htmlFor="website" hint="Optional">
          Website
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={defaults.website}
          />
        </Label>
      </section>

      <FieldError message={state.error} />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending} size="lg">
          Save changes
        </Button>
        <a
          href="/profile"
          className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Cancel
        </a>
      </div>
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
