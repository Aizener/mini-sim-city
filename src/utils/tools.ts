export const useThrottle = (callback: Function, delay = 50) => {
  let timer: null | NodeJS.Timeout = null;
  return function(this: any, ...args: any) {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      callback.apply(this, args);
      timer && clearTimeout(timer);
      timer = null;
    }, delay);
  }
}