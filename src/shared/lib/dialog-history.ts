const DIALOG_ENTRY = 'newdokDialog';
let pendingClose: Promise<void> | undefined;

export function replacePageUrl(url: string) {
  const id = window.history.state?.[DIALOG_ENTRY];
  // Next.js copies its own fields. Passing __NA ourselves bypasses its URL update hook.
  window.history.replaceState(id ? { [DIALOG_ENTRY]: id } : null, '', url);
}

/** Give an open modal one Back step without replacing Next.js's history state. */
export function registerDialogHistory(onBack: () => void, isBusy: () => boolean) {
  const id = crypto.randomUUID();
  const openedPath = window.location.pathname;
  let disposed = false;
  let pushed = false;

  const onPopState = () => {
    if (disposed || !pushed || window.history.state?.[DIALOG_ENTRY] === id) return;
    if (isBusy()) {
      window.history.forward();
      return;
    }
    pushed = false;
    onBack();
  };

  // A close may still be traversing history. Also skip Strict Mode's discarded mount.
  void (pendingClose ?? Promise.resolve()).then(() => {
    if (disposed) return;
    window.history.pushState({ [DIALOG_ENTRY]: id }, '', window.location.href);
    pushed = true;
    window.addEventListener('popstate', onPopState);
  });

  return () => {
    disposed = true;
    window.removeEventListener('popstate', onPopState);
    // A link/router navigation owns its new entry; never go Back over that navigation.
    if (!pushed || window.history.state?.[DIALOG_ENTRY] !== id || window.location.pathname !== openedPath) return;
    const finalUrl = window.location.href;
    pendingClose = new Promise<void>((resolve) => {
      const finish = () => {
        window.removeEventListener('popstate', finish);
        // Applying filters may have replaced the modal entry's query. Keep the selection.
        if (window.location.pathname === openedPath && window.location.href !== finalUrl) {
          replacePageUrl(finalUrl);
        }
        pendingClose = undefined;
        resolve();
      };
      window.addEventListener('popstate', finish);
      window.history.back();
    });
  };
}
