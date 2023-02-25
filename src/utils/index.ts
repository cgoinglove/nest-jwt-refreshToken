export const wait = (delay: number) =>
  new Promise((timeout) => {
    setTimeout(timeout, delay);
  });

const isObject = (value) =>
  ['[object Array]', '[object Object]'].includes(
    Object.prototype.toString.call(value),
  );
/** target에 기존에 있는 프로퍼티만 병합 */
export const softMerge = <T>(target: T, source: any): T =>
  !isObject(target) || !isObject(source)
    ? target
    : Object.keys(target).reduce((a, key) => {
        if (source[key] != null)
          a[key] = isObject(a[key])
            ? softMerge(a[key], source[key])
            : source[key];
        return a;
      }, target);
