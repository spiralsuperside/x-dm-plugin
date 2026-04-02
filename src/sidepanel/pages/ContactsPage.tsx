import { useCampaignStore } from "../store/campaignStore";

export function ContactsPage() {
  const { contacts } = useCampaignStore();
  return (
    <div className="list">
      {contacts.length === 0 ? <p>No contacts loaded.</p> : null}
      {contacts.map((contact) => (
        <article className="card" key={contact.id}>
          <strong>@{contact.username}</strong>
          <p>Platform: {contact.platform}</p>
          <p>Opt out: {contact.optOut ? "yes" : "no"}</p>
        </article>
      ))}
    </div>
  );
}
