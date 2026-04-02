import type { CommandEnvelopeV1, CommandPayloadMap, CommandType } from "./contracts.v1";

const commandTypes: CommandType[] = [
  "project.create",
  "project.load",
  "campaign.create",
  "campaign.list",
  "campaign.update",
  "targets.import.csv",
  "targets.list",
  "target.capture.start",
  "template.upsert",
  "template.get",
  "template.preview.render",
  "run.create",
  "run.start",
  "run.pause",
  "run.cancel",
  "run.list",
  "settings.get",
  "settings.update"
];

export function isCommandEnvelope(value: unknown): value is CommandEnvelopeV1 {
  if (!value || typeof value !== "object") {
    return false;
  }
  const maybe = value as Record<string, unknown>;
  return (
    maybe.version === "v1" &&
    typeof maybe.requestId === "string" &&
    typeof maybe.type === "string" &&
    commandTypes.includes(maybe.type as CommandType) &&
    "payload" in maybe
  );
}

export function assertPayload<TType extends keyof CommandPayloadMap>(
  commandType: TType,
  payload: unknown
): asserts payload is CommandPayloadMap[TType] {
  if (payload === null || typeof payload !== "object") {
    throw new Error(`Invalid payload for ${commandType}`);
  }
}
