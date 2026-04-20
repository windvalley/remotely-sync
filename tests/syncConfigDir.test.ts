import { expect } from "chai";
import { listFilesInObsFolder } from "../src/obsFolderLister";
import { shouldSkipSyncItem } from "../src/sync";

describe("Config directory sync rules", () => {
  it("should include trash items when trash sync is enabled", () => {
    expect(
      shouldSkipSyncItem(
        ".trash/deleted.md",
        false,
        false,
        true,
        false,
        ".obsidian",
        "remotely-secure"
      )
    ).to.equal(false);

    expect(
      shouldSkipSyncItem(
        ".trash/deleted.md",
        false,
        false,
        false,
        false,
        ".obsidian",
        "remotely-secure"
      )
    ).to.equal(true);
  });

  it("should respect the bookmark toggle when config sync is disabled", () => {
    expect(
      shouldSkipSyncItem(
        ".obsidian/bookmarks.json",
        false,
        false,
        false,
        true,
        ".obsidian",
        "remotely-secure"
      )
    ).to.equal(false);

    expect(
      shouldSkipSyncItem(
        ".obsidian/bookmarks.json",
        false,
        false,
        false,
        false,
        ".obsidian",
        "remotely-secure"
      )
    ).to.equal(true);
  });

  it("should always skip the current plugin data.json inside config sync", () => {
    expect(
      shouldSkipSyncItem(
        ".obsidian/plugins/remotely-sync/data.json",
        true,
        false,
        false,
        true,
        ".obsidian",
        "remotely-sync"
      )
    ).to.equal(true);

    expect(
      shouldSkipSyncItem(
        ".obsidian/plugins/remotely-sync/manifest.json",
        true,
        false,
        false,
        true,
        ".obsidian",
        "remotely-sync"
      )
    ).to.equal(false);
  });

  it("should use the provided plugin id when listing config files", async () => {
    const entries = new Map<string, any>([
      [
        ".obsidian",
        {
          type: "folder",
          ctime: 1,
          mtime: 1,
          size: 0,
          folders: [".obsidian/plugins"],
          files: [".obsidian/app.json"],
        },
      ],
      [
        ".obsidian/plugins",
        {
          type: "folder",
          ctime: 1,
          mtime: 1,
          size: 0,
          folders: [
            ".obsidian/plugins/remotely-sync",
            ".obsidian/plugins/other-plugin",
          ],
          files: [],
        },
      ],
      [
        ".obsidian/plugins/remotely-sync",
        {
          type: "folder",
          ctime: 1,
          mtime: 1,
          size: 0,
          folders: [".obsidian/plugins/remotely-sync/assets"],
          files: [
            ".obsidian/plugins/remotely-sync/data.json",
            ".obsidian/plugins/remotely-sync/main.js",
          ],
        },
      ],
      [
        ".obsidian/plugins/remotely-sync/assets",
        {
          type: "folder",
          ctime: 1,
          mtime: 1,
          size: 0,
          folders: [],
          files: [".obsidian/plugins/remotely-sync/assets/logo.svg"],
        },
      ],
      [
        ".obsidian/plugins/other-plugin",
        {
          type: "folder",
          ctime: 1,
          mtime: 1,
          size: 0,
          folders: [".obsidian/plugins/other-plugin/assets"],
          files: [".obsidian/plugins/other-plugin/data.json"],
        },
      ],
      [
        ".obsidian/plugins/other-plugin/assets",
        {
          type: "folder",
          ctime: 1,
          mtime: 1,
          size: 0,
          folders: [],
          files: [".obsidian/plugins/other-plugin/assets/logo.svg"],
        },
      ],
      [
        ".obsidian/app.json",
        {
          type: "file",
          ctime: 1,
          mtime: 1,
          size: 10,
        },
      ],
      [
        ".obsidian/plugins/remotely-sync/data.json",
        {
          type: "file",
          ctime: 1,
          mtime: 1,
          size: 10,
        },
      ],
      [
        ".obsidian/plugins/remotely-sync/main.js",
        {
          type: "file",
          ctime: 1,
          mtime: 1,
          size: 10,
        },
      ],
      [
        ".obsidian/plugins/remotely-sync/assets/logo.svg",
        {
          type: "file",
          ctime: 1,
          mtime: 1,
          size: 10,
        },
      ],
      [
        ".obsidian/plugins/other-plugin/data.json",
        {
          type: "file",
          ctime: 1,
          mtime: 1,
          size: 10,
        },
      ],
      [
        ".obsidian/plugins/other-plugin/assets/logo.svg",
        {
          type: "file",
          ctime: 1,
          mtime: 1,
          size: 10,
        },
      ],
    ]);

    const vault = {
      configDir: ".obsidian",
      adapter: {
        stat: async (path: string) => {
          return entries.get(path);
        },
        list: async (path: string) => {
          const entry = entries.get(path);
          return {
            folders: entry.folders ?? [],
            files: entry.files ?? [],
          };
        },
      },
    };

    const listed = await listFilesInObsFolder(vault as any, "remotely-sync", false);
    const keys = listed.map((x) => x.key);

    expect(keys).to.include(".obsidian/plugins/remotely-sync/data.json");
    expect(keys).to.include(".obsidian/plugins/remotely-sync/main.js");
    expect(keys).to.not.include(".obsidian/plugins/remotely-sync/assets/");
    expect(keys).to.not.include(".obsidian/plugins/remotely-sync/assets/logo.svg");
    expect(keys).to.include(".obsidian/plugins/other-plugin/assets/logo.svg");
  });
});
