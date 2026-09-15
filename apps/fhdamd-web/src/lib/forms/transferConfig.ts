export type FieldConfig =
  | { type: "text"; name: string; label: string; required?: boolean; maxLength?: number }
  | { type: "select"; name: string; label: string; options: string[]; required?: boolean }
  | { type: "number"; name: string; label: string; min?: number; max?: number; required?: boolean }
  | { type: "boolean"; name: string; label: string };

export interface StepConfig {
  id: string;
  title: string;
  fields: FieldConfig[];
  /** Evaluated against answers collected so far — skips the whole step if true. */
  skipIf?: (values: Record<string, unknown>) => boolean;
}

export const transferFormSteps: StepConfig[] = [
  {
    id: "trip",
    title: "Trip type & route",
    fields: [
      { type: "select", name: "tripType", label: "Trip type", options: ["one-way", "return"], required: true },
      { type: "text", name: "pickup", label: "Pickup location", required: true, maxLength: 200 },
      { type: "text", name: "dropoff", label: "Drop-off location", required: true, maxLength: 200 },
    ],
  },
  {
    id: "return",
    title: "Return details",
    skipIf: (values) => values.tripType !== "return",
    fields: [{ type: "text", name: "returnDate", label: "Return date", required: true }],
  },
  {
    id: "passengers",
    title: "Passengers & luggage",
    fields: [
      { type: "number", name: "passengers", label: "Passengers", min: 1, max: 8, required: true },
      { type: "boolean", name: "needsChildSeat", label: "Travelling with a child under 4?" },
    ],
  },
  {
    id: "vehicle",
    title: "Vehicle & extras",
    fields: [
      {
        type: "select",
        name: "vehicleClass",
        label: "Vehicle class",
        options: ["sedan", "suv", "van"],
        required: true,
      },
      { type: "boolean", name: "meetAndGreet", label: "Add meet-and-greet at arrivals?" },
      { type: "boolean", name: "flightTracking", label: "Track my flight for pickup timing?" },
    ],
  },
  {
    id: "contact",
    title: "Contact details",
    fields: [
      { type: "text", name: "name", label: "Full name", required: true, maxLength: 200 },
      { type: "text", name: "email", label: "Email", required: true, maxLength: 320 },
      { type: "text", name: "phone", label: "Phone", required: true, maxLength: 40 },
      { type: "text", name: "notes", label: "Special instructions", maxLength: 500 },
    ],
  },
];
