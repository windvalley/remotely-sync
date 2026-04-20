import type {
  ConfigDirSnapshotMetaRecord,
  ConfigDirSnapshotRecord,
  FileFolderHistoryRecord,
} from "./localdb";
import type { ObsConfigDirFileType } from "./obsFolderLister";

export interface ConfigDirSnapshotScope {
  configDir: string;
  syncConfigDir: boolean;
  syncTrash: boolean;
  syncBookmarks: boolean;
}

export const isConfigDirSnapshotMetaCompatible = (
  meta: ConfigDirSnapshotMetaRecord | undefined,
  scope: ConfigDirSnapshotScope
) => {
  if (meta === undefined) {
    return false;
  }
  return (
    meta.configDir === scope.configDir &&
    meta.syncConfigDir === scope.syncConfigDir &&
    meta.syncTrash === scope.syncTrash &&
    meta.syncBookmarks === scope.syncBookmarks
  );
};

export const buildConfigDirSnapshotRecords = (
  localConfigDirContents: ObsConfigDirFileType[],
  shouldTrack: (key: string) => boolean,
  vaultRandomID: string
) => {
  const snapshot: ConfigDirSnapshotRecord[] = [];
  for (const entry of localConfigDirContents) {
    if (!shouldTrack(entry.key)) {
      continue;
    }
    snapshot.push({
      key: entry.key,
      keyType: entry.type,
      vaultRandomID: vaultRandomID,
    });
  }
  snapshot.sort((a, b) => a.key.localeCompare(b.key));
  return snapshot;
};

export const collectRecreatedConfigKeys = (
  snapshot: ConfigDirSnapshotRecord[],
  localConfigDirContents: ObsConfigDirFileType[]
) => {
  const prevKeys = new Set(snapshot.map((entry) => entry.key));
  const keys = new Set<string>();
  for (const entry of localConfigDirContents) {
    if (!prevKeys.has(entry.key)) {
      keys.add(entry.key);
    }
  }
  return keys;
};

export const synthesizeDeletedConfigDirRecords = (
  snapshot: ConfigDirSnapshotRecord[],
  localConfigDirContents: ObsConfigDirFileType[],
  localHistory: FileFolderHistoryRecord[],
  shouldTrack: (key: string) => boolean,
  actionWhen: number,
  vaultRandomID: string
) => {
  const currentKeys = new Set(
    localConfigDirContents
      .filter((entry) => shouldTrack(entry.key))
      .map((entry) => entry.key)
  );
  const existingDeleteKeys = new Set(
    localHistory
      .filter((entry) => entry.actionType === "delete" || entry.actionType === "rename")
      .map((entry) =>
        entry.keyType === "folder" && !entry.key.endsWith("/")
          ? `${entry.key}/`
          : entry.key
      )
  );

  const synthesized: FileFolderHistoryRecord[] = [];
  for (const entry of snapshot) {
    if (!shouldTrack(entry.key)) {
      continue;
    }
    if (currentKeys.has(entry.key) || existingDeleteKeys.has(entry.key)) {
      continue;
    }
    synthesized.push({
      key: entry.key,
      ctime: 0,
      mtime: 0,
      size: 0,
      actionWhen: actionWhen,
      actionType: "delete",
      keyType: entry.keyType,
      renameTo: "",
      vaultRandomID: vaultRandomID,
    });
  }

  synthesized.sort((a, b) => a.key.localeCompare(b.key));
  return synthesized;
};
