import { expect } from "chai";
import {
  buildConfigDirSnapshotRecords,
  collectRecreatedPluginRoots,
  isConfigDirSnapshotMetaCompatible,
  synthesizeDeletedConfigDirRecords,
} from "../src/configDirSnapshot";

describe("Config dir snapshot", () => {
  it("should compare snapshot scope correctly", () => {
    expect(
      isConfigDirSnapshotMetaCompatible(
        {
          configDir: ".obsidian",
          syncConfigDir: true,
          syncTrash: false,
          syncBookmarks: true,
          capturedAt: 1,
          vaultRandomID: "vault",
        },
        {
          configDir: ".obsidian",
          syncConfigDir: true,
          syncTrash: false,
          syncBookmarks: true,
        }
      )
    ).to.equal(true);

    expect(
      isConfigDirSnapshotMetaCompatible(
        {
          configDir: ".obsidian",
          syncConfigDir: true,
          syncTrash: false,
          syncBookmarks: true,
          capturedAt: 1,
          vaultRandomID: "vault",
        },
        {
          configDir: ".obsidian",
          syncConfigDir: false,
          syncTrash: false,
          syncBookmarks: true,
        }
      )
    ).to.equal(false);
  });

  it("should synthesize deletes for missing config dir entries", () => {
    const snapshot = buildConfigDirSnapshotRecords(
      [
        {
          key: ".obsidian/plugins/notes/",
          ctime: 1,
          mtime: 1,
          size: 0,
          type: "folder",
        },
        {
          key: ".obsidian/plugins/notes/main.js",
          ctime: 1,
          mtime: 1,
          size: 10,
          type: "file",
        },
      ],
      () => true,
      "vault"
    );

    const synthesized = synthesizeDeletedConfigDirRecords(
      snapshot,
      [],
      [],
      () => true,
      123,
      "vault"
    );

    expect(synthesized.map((x) => x.key)).deep.equal([
      ".obsidian/plugins/notes/",
      ".obsidian/plugins/notes/main.js",
    ]);
    expect(synthesized.every((x) => x.actionType === "delete")).to.equal(true);
  });

  it("should not synthesize deletes that already exist in local history", () => {
    const snapshot = buildConfigDirSnapshotRecords(
      [
        {
          key: ".obsidian/plugins/notes/",
          ctime: 1,
          mtime: 1,
          size: 0,
          type: "folder",
        },
      ],
      () => true,
      "vault"
    );

    const synthesized = synthesizeDeletedConfigDirRecords(
      snapshot,
      [],
      [
        {
          key: ".obsidian/plugins/notes/",
          ctime: 0,
          mtime: 0,
          size: 0,
          actionWhen: 100,
          actionType: "delete",
          keyType: "folder",
          renameTo: "",
          vaultRandomID: "vault",
        },
      ],
      () => true,
      123,
      "vault"
    );

    expect(synthesized).deep.equal([]);
  });

  it("should detect recreated plugin roots only when they were absent before", () => {
    const snapshot = buildConfigDirSnapshotRecords(
      [
        {
          key: ".obsidian/plugins/existing/",
          ctime: 1,
          mtime: 1,
          size: 0,
          type: "folder",
        },
      ],
      () => true,
      "vault"
    );

    const recreated = collectRecreatedPluginRoots(
      snapshot,
      [
        {
          key: ".obsidian/plugins/existing/",
          ctime: 2,
          mtime: 2,
          size: 0,
          type: "folder",
        },
        {
          key: ".obsidian/plugins/new-plugin/",
          ctime: 2,
          mtime: 2,
          size: 0,
          type: "folder",
        },
      ],
      ".obsidian"
    );

    expect([...recreated]).deep.equal([".obsidian/plugins/new-plugin/"]);
  });
});
