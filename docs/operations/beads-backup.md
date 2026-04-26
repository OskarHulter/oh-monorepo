# Beads Backup

Off-machine recovery for the `bd` issue tracker. The Dolt DB lives in `.beads/embeddeddolt/`; lose the disk and you lose every issue, comment, and dependency edge unless a backup destination is configured.

## Current state

- **Local snapshots**: `.beads/backup/*.darc` files refresh every 15 minutes (auto-enabled because a git remote was detected). These survive `.beads/dolt/` corruption but **not** disk failure.
- **JSONL export**: `.beads/issues.jsonl` is rewritten on every `bd` write but is gitignored — see `.beads/.gitignore`. It is on disk but not under version control.
- **Off-machine**: nothing. No Dolt remote is configured (`bd dolt remote list` → empty). `bd backup status` shows `enabled=true` but with no destination, sync is a no-op.

## Pick one (or both)

### Option 1 — DoltHub remote (recommended for cloud)

Native Dolt federation. Free for public repos.

```bash
# Create a public Dolt repo at https://www.dolthub.com/repositories/<user>
bd backup init "https://doltremoteapi.dolthub.com/<user>/oh-monorepo-beads"

# Auth
export DOLT_REMOTE_USER=<user>
export DOLT_REMOTE_PASSWORD=<token>  # https://www.dolthub.com/settings/credentials

bd backup sync       # one-shot push
bd backup status     # confirm last successful push
```

After init, `bd` syncs automatically on the configured interval. Restore on a fresh machine with `bd backup restore`.

### Option 2 — Local filesystem path (external drive, NAS, or cloud-synced folder)

```bash
bd backup init ~/Backups/oh-monorepo-beads     # any writable path
bd backup sync
bd backup status
```

Point at a path that is itself replicated (Time Machine, rsync, Syncthing, iCloud Drive, etc.). The Dolt repo is copied as a directory tree.

## Restore

```bash
# Fresh clone, no .beads/embeddeddolt yet
bd backup restore                              # uses configured destination
# or
bd backup restore <path-or-url>                # one-off
```

## Health check

Add to the session-close protocol:

```bash
bd backup status     # 'Last backup' should be < interval old; destination set
```

If `Last backup` says `never` or the destination is empty, sync did not run. Re-run `bd backup sync` and inspect the output.

## Notes

- The auto-export in `config.yaml` (`backup:` block) is a separate mechanism — it writes the **JSONL** snapshot to `.beads/backup/` for fast local recovery. `bd backup` is the **Dolt-level** backup that goes off-machine.
- Do not commit the JSONL backup directory; it is gitignored. The backup destination handles durability.
- DoltHub is free for public repos. If issue contents are sensitive, use a private DoltHub repo (paid) or Option 2 with an encrypted filesystem.
