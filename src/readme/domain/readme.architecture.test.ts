import { describe, expect, it } from "vitest";
import { getTranslations } from "./i18n/index.js";
import { renderArchitectureSection, replaceArchitectureSection } from "./readme.architecture.js";

const architecture = {
  mermaid: "flowchart LR\n  cli --> readme",
  components: [{ name: "cli", tech: "Node.js", detail: "Generates documentation" }],
};

describe("architecture section", () => {
  it("renders and replaces only the existing architecture section", () => {
    const section = renderArchitectureSection(architecture, getTranslations("en"));
    const markdown = "# Demo\n\nIntro\n\n## 🏗️ Architecture\n\nold diagram\n\n## 📄 License\n\nMIT\n";

    const updated = replaceArchitectureSection(markdown, section);

    expect(updated).toContain("flowchart LR");
    expect(updated).not.toContain("old diagram");
    expect(updated).toContain("## 📄 License\n\nMIT");
  });

  it("appends the architecture section when it does not exist", () => {
    expect(replaceArchitectureSection("# Demo\n", "replacement")).toBe("# Demo\n\nreplacement\n");
  });

  it("replaces a standard Spanish architecture heading", () => {
    const updated = replaceArchitectureSection("# Demo\n\n## Arquitectura\n\nantiguo\n", "replacement");

    expect(updated).toBe("# Demo\n\nreplacement\n");
  });
});
