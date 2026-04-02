import { useCampaignStore } from "../../store/campaignStore";

export function CampaignControls() {
  const {
    campaignNameInput,
    setCampaignNameInput,
    csvInput,
    setCsvInput,
    templateInput,
    setTemplateInput,
    preview,
    createCampaign,
    importCsv,
    captureTargets,
    saveTemplate,
    renderPreview,
    createRun
  } = useCampaignStore();

  return (
    <div className="panel-grid">
      <section className="card">
        <h3>Create Campaign</h3>
        <input
          value={campaignNameInput}
          onChange={(event) => setCampaignNameInput(event.target.value)}
          placeholder="Campaign name"
        />
        <div className="row">
          <button onClick={() => void createCampaign("x")}>Create X Campaign</button>
          <button onClick={() => void createCampaign("reddit")}>Create Reddit Campaign</button>
        </div>
      </section>

      <section className="card">
        <h3>Targets</h3>
        <textarea
          value={csvInput}
          onChange={(event) => setCsvInput(event.target.value)}
          placeholder={"@alice\n@bob\n@charlie"}
        />
        <div className="row">
          <button onClick={() => void importCsv("x")}>Import CSV (X)</button>
          <button onClick={() => void importCsv("reddit")}>Import CSV (Reddit)</button>
        </div>
        <div className="row">
          <button onClick={() => void captureTargets("x")}>Capture From X Page</button>
          <button onClick={() => void captureTargets("reddit")}>Capture From Reddit Page</button>
        </div>
      </section>

      <section className="card">
        <h3>Template</h3>
        <textarea
          value={templateInput}
          onChange={(event) => setTemplateInput(event.target.value)}
          placeholder="{Hey | Hi} {name}"
        />
        <div className="row">
          <button onClick={() => void saveTemplate()}>Save Template</button>
          <button onClick={() => void renderPreview("Alex")}>Preview</button>
        </div>
        <p className="preview">{preview}</p>
      </section>

      <section className="card">
        <h3>Run</h3>
        <button onClick={() => void createRun()}>Create Run Queue</button>
      </section>
    </div>
  );
}
