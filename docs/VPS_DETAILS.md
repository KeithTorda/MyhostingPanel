PHCRAFTER_SSH_HOST=187.77.156.161
PHCRAFTER_SSH_USER=root
PHCRAFTER_SSH_KEY=C:\Users\admin\.ssh\phcrafter_vps2_ed25519
PHCRAFTER_SSH_PASSWORD=DISABLED (SSH Key Only)
PHCRAFTER_VPS2_SSH_HOST=187.127.109.117
PHCRAFTER_VPS2_SSH_USER=root
PHCRAFTER_VPS2_SSH_KEY=C:\Users\admin\.ssh\phcrafter_vps2_ed25519
PHCRAFTER_VPS2_SSH_PASSWORD=DISABLED (SSH Key Only)

## SECURITY STATUS (2026-05-04)
- Fail2Ban: INSTALLED & ACTIVE (Both VPS)
- SSH Password Login: DISABLED (Both VPS)
- Primary Auth Method: SSH Key (phcrafter_vps2_ed25519)

## PTERODACTYL PANEL FIX LOG

### Date
- 2026-05-04

### Scope
- Pterodactyl file manager checkbox alignment
- File row action menu positioning
- Dropdown disappearing / hanging behavior

### Server
- Host: primary Pterodactyl VPS
- Panel path: `/var/www/pterodactyl`

### Issues Found
- File selection checkbox was using absolute positioning, causing it to shift and look unstable across rows.
- Right-click file context menu was sending incomplete coordinates, so the menu could open far from the selected file row.
- Shared dropdown logic reused stale anchor coordinates, so menus could open detached from the clicked 3-dot button.
- File rows use a hover transform, and the dropdown was rendered inside that transformed row, causing the menu to visually disappear, clip, or act like it was hanging.

### Files Updated
- `/var/www/pterodactyl/resources/scripts/components/server/files/SelectFileCheckbox.tsx`
- `/var/www/pterodactyl/resources/scripts/components/server/files/FileObjectRow.tsx`
- `/var/www/pterodactyl/resources/scripts/components/server/files/FileDropdownMenu.tsx`
- `/var/www/pterodactyl/resources/scripts/components/elements/DropdownMenu.tsx`

### What Was Changed
- Removed absolute checkbox layout and converted it to a stable inline row-aligned control.
- Stopped checkbox click propagation so selection interaction does not interfere with row actions.
- Changed file row context menu event payload to send both `x` and `y` screen coordinates.
- Updated file dropdown listener to use the corrected context menu coordinates.
- Refactored shared dropdown placement logic to support separate anchor modes:
  - `toggle` for 3-dot button clicks
  - `context` for right-click file row actions
- Improved dropdown re-positioning so it recalculates correctly when opening from a different row.
- Rendered the dropdown through the panel portal instead of inside the transformed file row, preventing disappearing/clipping/hanging behavior.
- Stabilized the 3-dot trigger container alignment inside each file row.

### Validation Performed
- Rebuilt panel frontend assets with:
  - `cd /var/www/pterodactyl && npm run build`
- Result:
  - Webpack build completed successfully after each patch stage.

### Backups Created
- `/var/www/pterodactyl/resources/scripts/components/server/files/SelectFileCheckbox.tsx.bak.codex-20260504`
- `/var/www/pterodactyl/resources/scripts/components/server/files/FileObjectRow.tsx.bak.codex-20260504`
- `/var/www/pterodactyl/resources/scripts/components/server/files/FileDropdownMenu.tsx.bak.codex-20260504`
- `/var/www/pterodactyl/resources/scripts/components/server/files/FileDropdownMenu.tsx.bak.codex-20260504b`
- `/var/www/pterodactyl/resources/scripts/components/elements/DropdownMenu.tsx.bak.codex-20260504`
- `/var/www/pterodactyl/resources/scripts/components/elements/DropdownMenu.tsx.bak.codex-20260504b`
- `/var/www/pterodactyl/resources/scripts/components/elements/DropdownMenu.tsx.bak.codex-20260504c`

### Current Status
- Checkbox alignment fix: done
- 3-dot action menu positioning fix: done
- Right-click context menu positioning fix: done
- Dropdown disappearing / hanging fix: done
- Client-friendly move modal: done

### High-Impact File Manager Upgrade
- Added a new move workflow that no longer requires clients to manually type relative paths.
- New modal lets the user:
  - browse folders
  - go up one level
  - see breadcrumbs
  - preview the final target path
  - rename a single file/folder while moving
- Integrated the new move modal into:
  - single-file actions menu
  - mass actions bar for multi-select move
- Backend API was kept unchanged by converting the chosen destination into the relative path format expected by the existing rename/move endpoint.
- Added safety validation to prevent moving a folder into itself or into its own subfolders.

### Files Added
- `/var/www/pterodactyl/resources/scripts/components/server/files/MoveFileModal.tsx`

### Files Updated For Move UX
- `/var/www/pterodactyl/resources/scripts/components/server/files/FileDropdownMenu.tsx`
- `/var/www/pterodactyl/resources/scripts/components/server/files/MassActionsBar.tsx`

### Move UX Backup Files
- `/var/www/pterodactyl/resources/scripts/components/server/files/FileDropdownMenu.tsx.bak.codex-20260504-moveux`
- `/var/www/pterodactyl/resources/scripts/components/server/files/MassActionsBar.tsx.bak.codex-20260504-moveux`

### Next Recommended Improvements
- Replace manual `Move` with folder picker modal
- Replace manual `Copy` with destination picker modal
- Optional modal editor for file editing with fallback to full-page editor

