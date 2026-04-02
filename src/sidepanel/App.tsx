import { useEffect } from "react";
import { useUiStore } from "./store/uiStore";
import { useCampaignStore } from "./store/campaignStore";
import { CampaignCanvasPage } from "./pages/CampaignCanvasPage";
import { ContactsPage } from "./pages/ContactsPage";
import { RunsPage } from "./pages/RunsPage";
import "./sidepanel.css";

export default function App() {
  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const campaigns = useCampaignStore((state) => state.campaigns);
  const selectedCampaignId = useCampaignStore((state) => state.selectedCampaignId);
  const loadCampaigns = useCampaignStore((state) => state.loadCampaigns);
  const selectCampaign = useCampaignStore((state) => state.selectCampaign);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  return (
    <main className="container">
      <header className="header">
        <h1>DM Dad Local</h1>
        <div className="row">
          <button onClick={() => setActiveTab("campaigns")}>Campaigns</button>
          <button onClick={() => setActiveTab("contacts")}>Contacts</button>
          <button onClick={() => setActiveTab("runs")}>Runs</button>
        </div>
      </header>

      <section className="card">
        <h3>Campaigns</h3>
        <div className="row wrap">
          {campaigns.map((campaign) => (
            <button
              key={campaign.id}
              className={selectedCampaignId === campaign.id ? "active" : ""}
              onClick={() => void selectCampaign(campaign.id)}
            >
              {campaign.name}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "campaigns" ? <CampaignCanvasPage /> : null}
      {activeTab === "contacts" ? <ContactsPage /> : null}
      {activeTab === "runs" ? <RunsPage /> : null}
    </main>
  );
}
