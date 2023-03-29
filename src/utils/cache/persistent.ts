import type { UserInfo } from '/#/store'
import type { ProjectConfig } from '/#/config'
import type { RouteLocationNormalized } from 'vue-router'

import { createLocalStorage, createSessionStorage } from '/@/utils/cache'
import { Memory } from './memory'
import {
  TOKEN_KEY,
  USER_INFO_KEY,
  ROLES_KEY,
  PROJ_CFG_KEY,
  APP_LOCAL_CACHE_KEY,
  APP_SESSION_CACHE_KEY,
  MULTIPLE_TABS_KEY,
} from '/@/enums/cacheEnum'
import { DEFAULT_CACHE_TIME } from '/@/settings/encryptionSetting'
import { toRaw } from 'vue'
import { pick, omit } from 'lodash-es'

interface BasicStore {
  [TOKEN_KEY]: string | number | null | undefined
  [USER_INFO_KEY]: UserInfo
  [ROLES_KEY]: string[]
  [PROJ_CFG_KEY]: ProjectConfig
  [MULTIPLE_TABS_KEY]: RouteLocationNormalized[]
}

type LocalStore = BasicStore

type SessionStore = BasicStore

export type BasicKeys = keyof BasicStore
type LocalKeys = keyof LocalStore
type SessionKeys = keyof SessionStore

const ls = createLocalStorage()
const ss = createSessionStorage()

const localMemory = new Memory(DEFAULT_CACHE_TIME)
const sessionMemory = new Memory(DEFAULT_CACHE_TIME)

function initPersistentMemory() {
  const localCache = ls.get(APP_LOCAL_CACHE_KEY)
  const sessionCache = ss.get(APP_SESSION_CACHE_KEY)
  localCache && localMemory.resetCache(localCache)
  sessionCache && sessionMemory.resetCache(sessionCache)
}

export class Persistent {
  static getLocal<T>(key: LocalKeys) {
    return localMemory.get(key)?.value as Nullable<T>
  }

  /**
   *
   * 这段代码是一个静态方法，用于将一个值存储在本地缓存中。它接受三个参数：
   *
   * key：缓存的键名，类型为 LocalKeys，是一个枚举值，用于标识不同的缓存项；
   * value：要存储的值，类型为 LocalStore[LocalKeys]，是一个泛型类型，根据 key 的不同可以存储不同类型的值；
   * immediate：一个可选的布尔值，表示是否立即将缓存内容存储到本地存储中。
   * 该方法首先将 value 转换为原始值，然后将其存储在 localMemory 对象中。localMemory 是一个 Memory 类的实例，
   * 用于管理本地缓存。set 方法是 Memory 类中的一个方法，用于设置缓存。
   * 在这里，key 就是 Memory 类中的泛型类型 T 的一个属性名，value 则是 Memory 类中泛型类型 V 的值。
   *
   * 最后，如果 immediate 参数为 true，则调用了 ls.set 方法将缓存内容存储到本地存储中
   * ls 是一个封装了浏览器本地存储 API 的工具对象，APP_LOCAL_CACHE_KEY 是一个常量，表示本地缓存的键名。
   */
  static setLocal(key: LocalKeys, value: LocalStore[LocalKeys], immediate = false): void {
    localMemory.set(key, toRaw(value))
    immediate && ls.set(APP_LOCAL_CACHE_KEY, localMemory.getCache)
  }

  static removeLocal(key: LocalKeys, immediate = false): void {
    localMemory.remove(key)
    immediate && ls.set(APP_LOCAL_CACHE_KEY, localMemory.getCache)
  }

  static clearLocal(immediate = false): void {
    localMemory.clear()
    immediate && ls.clear()
  }

  static getSession<T>(key: SessionKeys) {
    return sessionMemory.get(key)?.value as Nullable<T>
  }

  static setSession(key: SessionKeys, value: SessionStore[SessionKeys], immediate = false): void {
    sessionMemory.set(key, toRaw(value))
    immediate && ss.set(APP_SESSION_CACHE_KEY, sessionMemory.getCache)
  }

  static removeSession(key: SessionKeys, immediate = false): void {
    sessionMemory.remove(key)
    immediate && ss.set(APP_SESSION_CACHE_KEY, sessionMemory.getCache)
  }
  static clearSession(immediate = false): void {
    sessionMemory.clear()
    immediate && ss.clear()
  }

  static clearAll(immediate = false) {
    sessionMemory.clear()
    localMemory.clear()
    if (immediate) {
      ls.clear()
      ss.clear()
    }
  }
}

window.addEventListener('beforeunload', function () {
  // TOKEN_KEY 在登录或注销时已经写入到storage了，此处为了解决同时打开多个窗口时token不同步的问题
  ss.set(APP_SESSION_CACHE_KEY, {
    ...omit(sessionMemory.getCache),
    ...pick(ss.get(APP_SESSION_CACHE_KEY), [TOKEN_KEY, USER_INFO_KEY]),
  })
})

function storageChange(e: any) {
  const { key, newValue, oldValue } = e

  if (!key) {
    Persistent.clearAll()
    return
  }

  if (!!newValue && !!oldValue) {
    if (APP_LOCAL_CACHE_KEY === key) {
      Persistent.clearLocal()
    }
    if (APP_SESSION_CACHE_KEY === key) {
      Persistent.clearSession()
    }
  }
}

window.addEventListener('storage', storageChange)

initPersistentMemory()
