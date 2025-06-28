export const isLatestGreaterThanCurrent = (latest: string, current: string) => {
  const [latestMajor, latestMinor, latestPatch] = latest.split('.').map((s) => parseInt(s, 10));
  const [currentMajor, currentMinor, currentPatch] = current.split('.').map((s) => parseInt(s, 10));

  return (
    latestMajor > currentMajor ||
    (latestMajor === currentMajor && latestMinor > currentMinor) ||
    (latestMajor === currentMajor && latestMinor === currentMinor && latestPatch > currentPatch)
  );
};