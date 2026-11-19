// next/cache: no cache in a test, functions run as they are.
export const unstable_cache = (fn) => fn;
export const revalidateTag = () => {};
export const revalidatePath = () => {};
export const cacheLife = () => {};
export const cacheTag = () => {};
export const unstable_noStore = () => {};
