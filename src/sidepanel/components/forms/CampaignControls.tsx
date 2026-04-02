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
    captureReplies,
    saveTemplate,
    renderPreview,
    createRun
  } = useCampaignStore();

  return (
    <div className="panel-grid">
      <section className="card">
        <h3>Create Campaign</h3>
        <p>Set platform, capture targets, then queue a paced DM run.</p>
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
        <p>Paste usernames (CSV/TXT style) or capture from the current page.</p>
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
        <div className="row">
          <button onClick={() => void captureReplies("x")}>Ingest X Replies</button>
          <button onClick={() => void captureReplies("reddit")}>Ingest Reddit Replies</button>
        </div>
      </section>

      <section className="card">
        <h3>Template</h3>
        <p>Use {'{name}'} and spintax like {'{Hey|Hi|Hello}'} for safe variation.</p>
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
        <p>Start, pause, retry, and cancel from the Runs tab.</p>
      </section>
    </div>
  );
}
