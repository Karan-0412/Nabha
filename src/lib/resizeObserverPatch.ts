// Patch ResizeObserver to avoid "ResizeObserver loop completed with undelivered notifications" in some browsers
// Strategy: wrap user callback in requestAnimationFrame and swallow errors to prevent uncaught loop exception

if (typeof window !== 'undefined' && (window as any).ResizeObserver) {
  try {
    const Original = (window as any).ResizeObserver;

    const Patched = function (this: any, callback: ResizeObserverCallback) {
      const wrapped: ResizeObserverCallback = (entries, observer) => {
        try {
          if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(() => {
              try {
                callback(entries, observer);
              } catch (e) {
                // swallow callback errors
                // console.debug('ResizeObserver callback error', e);
              }
            });
          } else {
            try {
              callback(entries, observer);
            } catch (e) {
              // swallow
            }
          }
        } catch (e) {
          // swallow
        }
      };

      // Construct underlying original observer with wrapped callback
      // eslint-disable-next-line new-cap
      const ro = new Original(wrapped);
      // Proxy methods to keep reference
      const proxy = ro as any;
      return proxy;
    } as any;

    // Preserve prototype so instanceof checks still work
    Patched.prototype = Original.prototype;
    (window as any).ResizeObserver = Patched;
  } catch (e) {
    // ignore
  }
}
