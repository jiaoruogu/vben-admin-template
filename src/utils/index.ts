import type { RouteLocationNormalized, RouteRecordNormalized } from 'vue-router'
import type { App, Plugin } from 'vue'

import { unref } from 'vue'
import { isObject } from '/@/utils/is'

export const noop = () => {}

/**
 * @description:  Set ui mount node
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body
}

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = ''
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&'
  }
  parameters = parameters.replace(/&$/, '')
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters
}

// 深度合并
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}

export function openWindow(
  url: string,
  opt?: { target?: TargetContext | string; noopener?: boolean; noreferrer?: boolean },
) {
  const { target = '__blank', noopener = true, noreferrer = true } = opt || {}
  const feature: string[] = []

  noopener && feature.push('noopener=yes')
  noreferrer && feature.push('noreferrer=yes')

  window.open(url, target, feature.join(','))
}

// dynamic use hook props
export function getDynamicProps<T, U>(props: T): Partial<U> {
  const ret: Recordable = {}

  Object.keys(props).map((key) => {
    ret[key] = unref((props as Recordable)[key])
  })

  return ret as Partial<U>
}

export function getRawRoute(route: RouteLocationNormalized): RouteLocationNormalized {
  if (!route) return route
  const { matched, ...opt } = route
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path,
        }))
      : undefined) as RouteRecordNormalized[],
  }
}

/**
 * 这是一个 TypeScript 函数，它接受一个组件和一个可选的别名，并将该组件转换为一个可安装的插件。
 *
 * 该函数的作用是在组件上添加一个静态方法 install，该方法会在插件安装时被调用。在 install 方法中，组件会被注册到 Vue 3 应用的全局组件中，并且如果提供了别名，它还会被注册到应用的全局属性中。
 *
 * 这个函数的返回类型是传入的组件类型 T 和 Plugin 接口的交叉类型，Plugin 接口是 Vue 3 插件的类型定义。
 *
 * 该函数通常用于将第三方组件库的组件包装为插件，以便在 Vue 3 应用中可以使用 app.use() 安装该组件库。例如，一个使用 withInstall 包装的组件库可以像下面这样安装：
 *
 * import { createApp } from 'vue'
 * import MyComponent from 'my-component-library'
 * import { withInstall } from 'with-install'
 *
 * const MyComponentPlugin = withInstall(MyComponent)
 *
 * const app = createApp(...)
 * app.use(MyComponentPlugin)
 *
 * 这样就可以在应用中使用 <my-component> 标签来渲染 MyComponent 组件了。
 */
export const withInstall = <T>(component: T, alias?: string) => {
  const comp = component as any
  comp.install = (app: App) => {
    app.component(comp.name || comp.displayName, component)
    if (alias) {
      app.config.globalProperties[alias] = component
    }
  }
  return component as T & Plugin
}
