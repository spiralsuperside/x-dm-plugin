import type { CommandEnvelopeV1, CommandPayloadMap, CommandResponseMap, CommandType, EventEnvelopeV1, EventPayloadMap, EventType } from "./contracts.v1";

export async function sendCommand<TType extends CommandType>(
  type: TType,
  payload: CommandPayloadMap[TType]
): Promise<CommandResponseMap[TType]> {
  const envelope: CommandEnvelopeV1<CommandPayloadMap[TType]> = {
    version: "v1",
    requestId: crypto.randomUUID(),
    type,
    payload
  };
  const response = (await chrome.runtime.sendMessage(envelope)) as CommandResponseMap[TType];
  return response;
}

export function subscribeEvents<TType extends EventType>(
  type: TType,
  listener: (payload: EventPayloadMap[TType], event: EventEnvelopeV1<EventPayloadMap[TType]>) => void
): () => void {
  const handler = (message: unknown) => {
    const envelope = message as EventEnvelopeV1<EventPayloadMap[TType]>;
    if (envelope && envelope.version === "v1" && envelope.type === type) {
      listener(envelope.payload, envelope);
    }
  };
  chrome.runtime.onMessage.addListener(handler);
  return () => chrome.runtime.onMessage.removeListener(handler);
}

export async function publishEvent<TType extends EventType>(
  type: TType,
  payload: EventPayloadMap[TType]
): Promise<void> {
  const event: EventEnvelopeV1<EventPayloadMap[TType]> = {
    version: "v1",
    eventId: crypto.randomUUID(),
    type,
    payload,
    at: new Date().toISOString()
  };
  await chrome.runtime.sendMessage(event);
}
