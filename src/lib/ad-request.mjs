export function requestDisplayAd(ad, queue) {
  if (
    !ad ||
    ad.dataset.requested ||
    ad.dataset.adsbygoogleStatus ||
    ad.getBoundingClientRect().width <= 0
  )
    return false;
  ad.dataset.requested = "true";
  try {
    queue.push({});
    return true;
  } catch {
    return false;
  }
}
