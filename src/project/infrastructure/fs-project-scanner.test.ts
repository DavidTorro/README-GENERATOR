import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FsProjectScanner } from "./fs-project-scanner.js";

let root: string | undefined;

afterEach(async () => {
  if (root) await rm(root, { recursive: true, force: true });
  root = undefined;
});

describe("FsProjectScanner", () => {
  it("reads environment examples but never a real .env file", async () => {
    root = await mkdtemp(join(tmpdir(), "readme-gen-"));
    await writeFile(join(root, ".env.example"), "PUBLIC_KEY=example\n", "utf8");
    await writeFile(join(root, ".env"), "SECRET_KEY=real-secret\n", "utf8");
    await writeFile(join(root, "README.md"), "# 📝 Demo Project\n", "utf8");
    await mkdir(join(root, "src"));
    await writeFile(join(root, "src", "routes.test.ts"), 'router.get("/fake", handler);', "utf8");

    const raw = new FsProjectScanner().scan(root);

    expect(raw.envExamples).toEqual({ ".env.example": "PUBLIC_KEY=example\n" });
    expect(raw.envExamples).not.toHaveProperty(".env");
    expect(raw.sources).not.toHaveProperty("src/routes.test.ts");
    expect(raw.readmeTitle).toBe("Demo Project");
  });
});
