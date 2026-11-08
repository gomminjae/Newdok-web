/** Selection handles on touch devices change the selection without a mouseup. */
export function observeSelectionChanges(document: Document, onChange: () => void) {
  const view = document.defaultView;
  let frame: number | undefined;
  const publish = () => { frame = undefined; onChange(); };
  const schedule = () => {
    if (frame !== undefined) return;
    if (view) frame = view.requestAnimationFrame(publish);
    else publish();
  };
  const events = ['selectionchange', 'pointerup', 'keyup'] as const;
  for (const event of events) document.addEventListener(event, schedule);
  return () => {
    for (const event of events) document.removeEventListener(event, schedule);
    if (frame !== undefined) view?.cancelAnimationFrame(frame);
  };
}
