import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Porchfest Host/Family Sponsorship",
  description:
    "Editable Porchfest host/family sponsorship sheet with tiers and benefits.",
  alternates: { canonical: "/host-family-sponsorship" },
};

const contactEmail = "Teresa@LRVCC.org";

const tiers = [
  { name: "Lyric", price: "$200" },
  { name: "Verse", price: "$500" },
  { name: "Chorus", price: "$800" },
];

const benefits = [
  {
    label: "Recognition in event guide",
    includes: ["Lyric", "Verse", "Chorus"],
  },
  {
    label: "Recognition as a sponsor on event website",
    includes: ["Verse", "Chorus"],
  },
  {
    label: "Recognition as a sponsor on social media stories",
    includes: ["Verse", "Chorus"],
  },
  {
    label: "One complimentary ticket to another LRVCC event in the calendar year",
    includes: ["Chorus"],
  },
  {
    label: "Dedicated yard sign provided by LRVCC",
    includes: ["Chorus"],
  },
  {
    label: "Dedicated porch banner provided by LRVCC",
    includes: ["Chorus"],
  },
];

function hasBenefit(benefit: string[], tier: string) {
  return benefit.includes(tier);
}

export default function HostFamilySponsorshipPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <div className="rounded-2xl border border-[#dbe7ff] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2563eb]">
          Porchfest
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1f2937]">
          Host / Family Sponsorship
        </h1>
        <p className="mt-4 max-w-3xl text-[#4b5563]">
          Thank you for being part of this beloved neighborhood tradition.
          Host families make Porchfest possible. If you&apos;d like to support the
          event further, consider one of the sponsorship levels below.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#dbe7ff]">
                <th className="py-3 pr-4 font-semibold text-[#1f2937]">Benefits</th>
                {tiers.map((tier) => (
                  <th key={tier.name} className="py-3 px-4 font-semibold text-[#1f2937]">
                    <div>{tier.name}</div>
                    <div className="text-[#2563eb]">{tier.price}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {benefits.map((benefit) => (
                <tr key={benefit.label} className="border-b border-[#edf3ff] align-top">
                  <td className="py-3 pr-4 text-[#4b5563]">{benefit.label}</td>
                  {tiers.map((tier) => (
                    <td key={`${benefit.label}-${tier.name}`} className="py-3 px-4">
                      {hasBenefit(benefit.includes, tier.name) ? (
                        <span className="font-bold text-[#16a34a]">✓</span>
                      ) : (
                        <span className="text-[#cbd5e1]">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-[#374151]">
          Interested in sponsoring? Email{" "}
          <a href={`mailto:${contactEmail}`} className="font-semibold text-[#2563eb] hover:underline">
            {contactEmail}
          </a>
          .
        </p>
      </div>

      <p className="mt-4 text-xs text-[#6b7280]">
        Editable note: if any tier checkmarks differ from your original PDF,
        I can adjust the matrix in under a minute.
      </p>
    </main>
  );
}
