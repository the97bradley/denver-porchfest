# Monitoring Checklist (Cloud-Only)

Primary provider: **UptimeRobot**

## Monitors to create

Create HTTP(s) monitors with 5-minute interval for:

1. `https://denverporchfest.com/`
2. `https://docs.google.com/forms/d/1S-mjWFTPde5L7l3qbkOzy-jtTKCzqIQLMw0alEM5zAE/viewform` (Artist)
3. `https://docs.google.com/forms/d/1hZONc8KKvk603YW_So8A-0rJE1hCDzx5L_8iI3HjKRs/viewform` (Host)
4. `https://docs.google.com/forms/d/e/1FAIpQLSdGGqud2IjV89O56-1SNxvxg5SW1Ubai81aGt7Ucf4IgLAdmw/viewform?usp=publish-editor` (Vendor)
5. `https://docs.google.com/forms/d/e/1FAIpQLSckxCBSKunojnMD4xJ6aPeT5kTfH2zpEGIpAtIogYNvz8yVhQ/viewform?usp=publish-editor` (Volunteer)
6. `https://denverporchfest.com/api/health`

## Alerting policy

- Trigger alert after **2 consecutive failures**
- Enable **recovery notifications**
- Add at least 2 channels:
  - Email
  - SMS / Push / Slack (backup)

## Ownership / runtime

- Checks run in **UptimeRobot cloud**
- No local machine or Raspberry Pi runtime required
