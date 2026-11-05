# Private renderer snapshots

`ciallo-renderer-<content-hash>.tgz` is built from the separate `ciallo-renderer/web`
package. The exact file is installed through `package.json` and `yarn.lock`.
Keep this archive in Git so GitHub Pages and other checkouts build without access
to a neighboring local repository or an unpublished npm package.

See `GALLARY.md` for the update workflow. Generated snapshots contain compiled
code and attribution; the source of truth is the renderer repository.
