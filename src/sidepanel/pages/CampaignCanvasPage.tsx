import { CampaignFlow } from "../components/flow/CampaignFlow";
import { CampaignControls } from "../components/forms/CampaignControls";

export function CampaignCanvasPage() {
  return (
    <div>
      <CampaignFlow />
      <CampaignControls />
    </div>
  );
}
