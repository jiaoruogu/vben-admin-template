export interface Cache<V = any> {
  value?: V
  timeoutId?: ReturnType<typeof setTimeout>
  time?: number
  alive?: number
}

const NOT_ALIVE = 0

/**
 * 这段代码定义了一个Memory类，用于管理缓存数据。其中，T和V分别代表存储在缓存中的数据的键值对的键和值的类型。
 * cache是一个用于存储缓存数据的对象，它的键是T类型的键，值是Cache类型的对象。alive表示缓存数据的存活时间，以毫秒为单位。
 * NOT_ALIVE是一个常量，表示缓存数据永远不过期。get方法用于获取指定键的缓存数据。set方法用于设置指定键的缓存数据，
 * 并可以指定存活时间。remove方法用于移除指定键的缓存数据。resetCache方法用于重置缓存数据。clear方法用于清空缓存数据。
 */
export class Memory<T = any, V = any> {
  private cache: { [key in keyof T]?: Cache<V> } = {}
  private alive: number

  constructor(alive = NOT_ALIVE) {
    // Unit second
    this.alive = alive * 1000
  }

  get getCache() {
    return this.cache
  }

  setCache(cache) {
    this.cache = cache
  }

  // get<K extends keyof T>(key: K) {
  //   const item = this.getItem(key);
  //   const time = item?.time;
  //   if (!isNullOrUnDef(time) && time < new Date().getTime()) {
  //     this.remove(key);
  //   }
  //   return item?.value ?? undefined;
  // }

  get<K extends keyof T>(key: K) {
    return this.cache[key]
  }

  set<K extends keyof T>(key: K, value: V, expires?: number) {
    let item = this.get(key)

    if (!expires || (expires as number) <= 0) {
      expires = this.alive
    }
    if (item) {
      if (item.timeoutId) {
        clearTimeout(item.timeoutId)
        item.timeoutId = undefined
      }
      item.value = value
    } else {
      item = { value, alive: expires }
      this.cache[key] = item
    }

    if (!expires) {
      return value
    }
    const now = new Date().getTime()
    /**
     * Prevent overflow of the setTimeout Maximum delay value
     * Maximum delay value 2,147,483,647 ms
     * https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value
     */
    item.time = expires > now ? expires : now + expires
    item.timeoutId = setTimeout(
      () => {
        this.remove(key)
      },
      expires > now ? expires - now : expires,
    )

    return value
  }

  remove<K extends keyof T>(key: K) {
    const item = this.get(key)
    Reflect.deleteProperty(this.cache, key)
    if (item) {
      clearTimeout(item.timeoutId!)
      return item.value
    }
  }

  resetCache(cache: { [K in keyof T]: Cache }) {
    Object.keys(cache).forEach((key) => {
      const k = key as any as keyof T
      const item = cache[k]
      if (item && item.time) {
        const now = new Date().getTime()
        const expire = item.time
        if (expire > now) {
          this.set(k, item.value, expire)
        }
      }
    })
  }

  clear() {
    Object.keys(this.cache).forEach((key) => {
      const item = this.cache[key]
      item.timeoutId && clearTimeout(item.timeoutId)
    })
    this.cache = {}
  }
}
