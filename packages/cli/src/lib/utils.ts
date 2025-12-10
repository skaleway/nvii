import updateNotifier from "update-notifier";
import type { Package } from "update-notifier";
import pc from "picocolors";

type options = {
  pkg: Package;
  message?: string;
  updateCheckInterval?: number;
};
export function checkForUpdates({
  pkg,
  message,
  updateCheckInterval = 1000 * 60 * 60 * 24 * 7,
}: options): void {
  const notifier = updateNotifier({
    pkg,
    updateCheckInterval,
  });

  if (notifier.update) {
    notifier.notify({
      isGlobal: true,
      message:
        message ??
        `🚀 Whoa! A new version (${pc.green("{latestVersion}")}) is out! (You have ${pc.red("{currentVersion}")})\n✨ Upgrade with: ${pc.blue("{updateCommand}")}\nDon't miss out on the cool stuff!`,
    });
  }
}
