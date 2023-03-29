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

  /**
   * 以上代码是一个泛型类 Memory 的 set 方法，用于设置缓存项。该方法接收三个参数：
   *
   * key: K 表示缓存项的键，类型为泛型 T 的属性名称；
   * value: V 表示缓存项的值，类型为泛型 V；
   * expires?: number 表示缓存项的过期时间，单位为毫秒。
   * 首先，该方法会根据传入的键获取对应的缓存项，如果缓存项存在，会根据过期时间来更新缓存项的值或过期时间；如果缓存项不存在，则会创建一个新的缓存项，并设置其值和过期时间。
   *
   * 如果传入的过期时间参数为空或小于等于0，则使用 alive 属性值作为过期时间。如果过期时间大于0，则将过期时间转换为毫秒，并设置缓存项的过期时间戳。由于 setTimeout 的最大延迟时间为 2147483647 毫秒，为了防止过期时间超出这个范围，这里会对过期时间进行判断处理。如果过期时间大于当前时间戳，则直接使用过期时间；否则，在当前时间戳基础上加上过期时间作为过期时间戳。
   *
   * 最后，该方法会启动一个定时器，等到缓存项过期后自动删除该缓存项，并返回设置的值。如果过期时间为 0 或者传入的过期时间参数小于等于 0，直接返回设置的值。
   *
   * 在这段代码中，泛型变量 K 代表了 key 参数的类型，它必须是 T 对象中的一个键（keyof T）；泛型变量 V 代表了 value 参数的类型，它可以是任意类型。
   */
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
