# obsidian-vault-sync

**obsidian-vault-sync** is an Obsidian sync plugin for S3, WebDAV, Dropbox, and OneDrive. It started from the *Remotely Save* codebase, but this repository now treats `obsidian-vault-sync` as a fully new plugin identity.

The Git repository, plugin directory, manifest id, and the name shown inside Obsidian are all `obsidian-vault-sync`.

Existing `remotely-save`, `remotely-secure`, and `remotely-sync` installations, settings, OAuth grants, and remote metadata are not considered compatible. Treat this as a fresh install and use a fresh remote namespace.

If you like it or find it useful, please consider give it a [star ![GitHub Repo stars](https://img.shields.io/github/stars/windvalley/obsidian-vault-sync?style=social)](https://github.com/windvalley/obsidian-vault-sync) on Github.

Pull requests greatly appreciated! Please see [Contributing](#contributing) to get started.

## Disclaimer

- **This is NOT the [official sync service](https://obsidian.md/sync) provided by Obsidian.**

## !!!Caution!!!

**ALWAYS, ALWAYS, backup your vault before using this plugin.**


## Security Updates from Remotely Save
- Updated encryption to use AES-GCM which is more secure and authenticates the ciphertext when decrypting, making it harder to exploit [padding oracle attacks](https://cryptopals.com/sets/3/challenges/17).
- Updated salt from 8 -> 16 bytes.
- Updated IV to not be derived from the user's password.
- **No security guarantees**, but these are the issues I identified when reviewing the end-to-end encryption as implemented in remotely-save.

## Features
- Supports:
  - Amazon S3 or S3-compatible
  - Dropbox
  - OneDrive for personal
  - Webdav
  - [Here](./docs/services_connectable_or_not.md) shows more connectable (or not-connectable) services in details. Need another service added? Please [open a feature request](#questions-suggestions-or-bugs)!
- **Obsidian Mobile supported.** Vaults can be synced across mobile and desktop devices with the cloud service as the "broker".
- **[End-to-end encryption](./docs/encryption.md) supported.** Files are encrypted using AES-256 GCM before being sent to the cloud **if** user specifies a password.
- **Scheduled auto sync supported.** You can also manually trigger the sync using sidebar ribbon, or using the command from the command palette (or even bind the hot key combination to the command then press the hot key combination).
- Sync on Save
- Sync status bar
- Syncing bookmarks by default, with optional syncing for other Obsidian configuration files and `.trash`
- Snapshot-based delete tracking for synced config items, so removals under `.obsidian`, `bookmarks.json`, and `.trash` can be propagated on the next successful sync
- **[Minimal Intrusive](./docs/minimal_intrusive_design.md).**
- **Fully open source under [Apache-2.0 License](./LICENSE).**
- **[Sync Algorithm open](./docs/sync_algorithm_v2.md) for discussion.**

## Limitations

- **To support syncing deleted files and synced config items, extra metadata is uploaded by default.** See [Minimal Intrusive](./docs/minimal_intrusive_design.md).
  - **No conflict resolution. No content-diff-and-patch algorithm.** All files and folders are compared using their local and remote "last modified time" and those with later "last modified time" win.
- **Config-item deletion tracking needs a baseline snapshot from the previous successful sync.** If you just enabled config, bookmark, or trash syncing, run one successful sync first to establish that baseline.
- **Cloud services cost you money.** Always be aware of the costs and pricing. Specifically, all the operations, including but not limited to downloading, uploading, listing all files, calling any api, storage sizes, may or may not cost you money.
- **Some limitations from the browser environment.** More technical details are [in the doc](./docs/browser_env.md).
- **You should protect your `data.json` file.** The file contains sensitive information.
  - It's strongly advised **NOT** to share your `data.json` file to anyone.
  - It's usually **NOT** a good idea to check the file into version control. By default, the plugin tries to create a `.gitignore` file inside the plugin directory if it doesn't exist, for ignoring `data.json` in the `git` version control. If you know exactly what it means and want to remove the setting, please modify the `.gitignore` file or set it to be empty.

## Fresh Install / Migration
The safest way to move from Remotely Save (or any older fork) to obsidian-vault-sync is:

1. Make a local, unencrypted backup of your files (make sure to synchronize all changes across your devices)
2. Disable and uninstall the old plugin
3. Install obsidian-vault-sync into `.obsidian/plugins/obsidian-vault-sync`
4. Configure obsidian-vault-sync from scratch and set a new encryption password if needed
5. Use a fresh remote namespace for the new plugin:
   - S3 / OSS / Minio: use a new empty bucket
   - WebDAV: use a new `remoteBaseDir`
   - Dropbox / OneDrive: build or install a release that already contains the new OAuth app credentials, then authorize it as a new app and keep a distinct `remoteBaseDir`
6. Perform the first sync with obsidian-vault-sync

## Credit
* Thanks to @fyears for the original Remotely Save plugin
* Thanks to @sampurkiszb for sync on save
* Thanks to @zaiziw for Obsidian bookmark sync
* Thanks to @FEI352 & @lyiton for helping translate the plugin
* Thanks to @kadisonm for major code contributions (including lightweight sync), refactoring, & bug fixes
* Thanks to @vpsone for status bar UI fix!

## Questions, Suggestions, Or Bugs

You are greatly welcome to ask questions, post any suggestions, or report any bugs! Pull requests also greatly appreciated. The project is mainly maintained on GitHub:

- Questions, suggestions, and bugs: [GitHub repo Issues](https://github.com/windvalley/obsidian-vault-sync/issues)
- Pull requests: [GitHub repo Pull Requests](https://github.com/windvalley/obsidian-vault-sync/pulls)

## Download and Install

- Option #1: Use [Obsidian42 - BRAT](https://github.com/TfTHacker/obsidian42-brat) and add `windvalley/obsidian-vault-sync`.
- Option #2: [![GitHub release (latest by SemVer and asset including pre-releases)](https://img.shields.io/github/downloads-pre/windvalley/obsidian-vault-sync/latest/main.js?sort=semver)](https://github.com/windvalley/obsidian-vault-sync/releases) Manually download `main.js`, `manifest.json`, and `styles.css` from the latest release.
- Option #3: Build from source.
- If you build Dropbox / OneDrive support yourself, configure the new OAuth app credentials in `.env` before running `npm run build2`.

## Contributing

Please see [GitHub Issues](https://github.com/windvalley/obsidian-vault-sync/issues) for current issues and priorities.

General priorities (may change):
P0: Top priority, sync broken or risk of data loss for all remote providers.
P1: Issue or major feature gap for all providers, usually has workaround
P2: Sync issue for some providers but not all, or for some users but not all
P3: Nice to have, or cosmetic issue. Does not impact sync.

Building the project:
```
git clone --recurse-submodules https://github.com/windvalley/obsidian-vault-sync
cd obsidian-vault-sync
npm install
cp .env.example.txt .env
```

Running development build (watches for changes and recompiles)
```
npm run dev2
```

Building a production build
```
npm run build2
```

Testing:
```
cp main.js styles.css manifest.json /your/path/to/vault/.obsidian/plugins/obsidian-vault-sync
```

Open development tools and Cmd+r or Ctrl+r to refresh the Obsidian app, quickly reloading the plugin.

## Usage

### S3

- Prepare your S3 (-compatible) service information: [endpoint, region](https://docs.aws.amazon.com/general/latest/gr/s3.html), [access key id, secret access key](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-your-credentials.html), bucket name. The bucket should be empty and solely for syncing a vault.
- About CORS:
  - If you are using Obsidian desktop >= 0.13.25 or mobile >= 1.1.1, you can skip this CORS part.
  - If you are using Obsidian desktop < 0.13.25 or mobile < 1.1.1, you need to configure (enable) [CORS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enabling-cors-examples.html) for requests from `app://obsidian.md` and `capacitor://localhost` and `http://localhost`, and add at least `ETag` into exposed headers. Full example is [here](./docs/s3_cors_configure.md). It's unfortunately required, because the plugin sends requests from a browser-like envirement. And those addresses are tested and found on desktop and ios and android.
- Download and enable this plugin.
- Enter your information to the settings of this plugin.
- If you want to enable end-to-end encryption, also set a password in settings. If you do not specify a password, the files and folders are synced in plain, original content to the cloud.
- Click the new "circle arrow" icon on the ribbon (the left sidebar), **every time** you want to sync your vault between local and remote. (Or, you could configure auto sync in the settings panel (See next chapter).) While syncing, the icon becomes "two half-circle arrows". Besides clicking the icon on the sidebar ribbon, you can also activate the corresponding command in the command palette.
- **Be patient while syncing.** Especially in the first-time sync.

### Dropbox

- **This plugin is NOT an official Dropbox product.** The plugin just uses Dropbox's public API.
- After the authorization, the plugin can read your name and email (which cannot be unselected on Dropbox api), and read and write files in your Dropbox's `/Apps/obsidian-vault-sync` folder.
- Self-built releases need a Dropbox OAuth app key in `.env` before `npm run build2`.
- If you decide to authorize this plugin to connect to Dropbox, please go to plugin's settings, and choose Dropbox then follow the instructions. [More with screenshot is here](./docs/dropbox_review_material/README.md).
- Password-based end-to-end encryption is also supported. But please be aware that **the vault name itself is not encrypted**.

### OneDrive for personal

- **This plugin is NOT an official Microsoft / OneDrive product.** The plugin just uses Microsoft's [OneDrive's public API](https://docs.microsoft.com/en-us/onedrive/developer/rest-api).
- This plugin only works for "OneDrive for personal", and not works for "OneDrive for Business" (yet). See [#11](https://github.com/fyears/remotely-save/issues/11) to further details.
- After the authorization, the plugin can read your name and email, and read and write files in your OneDrive's `/Apps/obsidian-vault-sync` folder.
- Self-built releases need `ONEDRIVE_CLIENT_ID` and `ONEDRIVE_AUTHORITY` in `.env` before `npm run build2`.
- If you decide to authorize this plugin to connect to OneDrive, please go to plugin's settings, and choose OneDrive then follow the instructions.
- Password-based end-to-end encryption is also supported. But please be aware that **the vault name itself is not encrypted**.
- Syncing empty files is not supported.

### webdav

- About CORS:
  - If you are using Obsidian desktop >= 0.13.25 or iOS >= 1.1.1, you can skip this CORS part.
  - If you are using Obsidian desktop < 0.13.25 or iOS < 1.1.1 or any Android version:
    - The webdav server has to be enabled CORS for requests from `app://obsidian.md` and `capacitor://localhost` and `http://localhost`, **AND** all webdav HTTP methods, **AND** all webdav headers. These are required, because Obsidian mobile works like a browser and mobile plugins are limited by CORS policies unless under a upgraded Obsidian version.
    - Popular software NextCloud, OwnCloud, `rclone serve webdav` do **NOT** enable CORS by default. If you are using any of them, you should evaluate the risk, and find a way to enable CORS, before using this plugin, or use a upgraded Obsidian version.
      - **Unofficial** workaround: NextCloud users can **evaluate the risk by themselves**, and if decide to accept the risk, they can install [WebAppPassword](https://apps.nextcloud.com/apps/webapppassword) app, and add `app://obsidian.md`, `capacitor://localhost`, `http://localhost` to `Allowed origins`
      - **Unofficial** workaround: OwnCloud users can **evaluate the risk by themselves**, and if decide to accept the risk, they can download `.tar.gz` of `WebAppPassword` above and manually install and configure it on their instances.
    - The plugin is tested successfully under python package [`wsgidav` (version 4.0)](https://github.com/mar10/wsgidav). See [this issue](https://github.com/mar10/wsgidav/issues/239) for some details.
- Your data would be synced to a `${vaultName}` sub folder on your webdav server.
- Password-based end-to-end encryption is also supported. But please be aware that **the vault name itself is not encrypted**.

### Alibaba Cloud OSS and Minio
- Use the S3 configuration
- Enable "Disable S3 metadata sync" if you get 403 or 400 errors. This means not syncing modification time until the provider-specific compatibility issue is resolved.


## Scheduled Auto Sync

- You can configure auto syncing every N minutes in settings.
- In auto sync mode, if any error occurs, the plugin would **fail silently**.
- Auto sync only works when Obsidian is being opened. It's **technically impossible** to auto sync while Obsidian is in background, because the plugin just works in the browser environment provided by Obsidian.

## How To Deal With Hidden Files Or Folders

**By default, all files or folder starting with `.` (dot) or `_` (underscore) are treated as hidden files, and would NOT be synced.** It's useful if you have some files just staying locally. But this strategy also means that themes / other plugins / settings of this plugin would neither be synced.

You can change the settings to allow syncing `_` files or folders, as well as `.obsidian` special config folder (but not any other `.` files or folders).

## How To Debug

See [here](./docs/how_to_debug/README.md) for more details.

## Troubleshooting

### password_not_matched
If you get a `password_not_matched` error while syncing, try:

1. making a backup of your vault
2. removing the vault folder on your remote sync service
3. syncing again.


## Bonus: Import And Export Not-Oauth2 Plugin Settings By QR Code

See [here](./docs/import_export_some_settings.md) for more details.
