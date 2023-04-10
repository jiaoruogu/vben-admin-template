import type { AppRouteRecordRaw, AppRouteModule } from '/@/router/types'

import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '/@/router/routes/basic'

import { PageEnum } from '/@/enums/pageEnum'
import { t } from '/@/hooks/web/useI18n'

// const modules = import.meta.globEager('./modules/*.ts')和
// const modules = import.meta.globEager('./modules/**/*.ts')
// 为什么效果是一样的，他们有什么区别吗
// 这两个语句的作用是导入一个目录下的所有模块（文件），并且返回一个对象，对象的属性名是文件名（去掉扩展名），属性值是导入的模块。
//
// 它们的区别在于 glob 模式的不同。
// ./modules/*.ts 意味着只会导入 ./modules 目录下的直接子文件，
// 而 ./modules/**/*.ts 意味着会导入 ./modules 目录下的所有子目录和文件。
//
// 如果目录下只有直接子文件，则这两个语句的效果是相同的。但如果目录下有子目录，
// 则 ./modules/*.ts 只会导入直接子文件，而 ./modules/**/*.ts 会递归导入子目录中的所有文件。
// 因此，./modules/**/*.ts 更加通用，可以处理更复杂的目录结构。

// import.meta.globEager() 直接引入所有的模块 Vite 独有的功能
// import.meta.globEager 已经弃用，请使用 import.meta.glob('*', { eager: true }) 来代替。
const modules = import.meta.globEager('./modules/**/*.ts')
const routeModuleList: AppRouteModule[] = []

// 加入到路由集合中
Object.keys(modules).forEach((key) => {
  // @ts-ignore
  const mod = modules[key].default || {}
  const modList = Array.isArray(mod) ? [...mod] : [mod]
  routeModuleList.push(...modList)
})

export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList]

// 根路由
export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
}

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('/@/views/sys/login/Login.vue'),
  meta: {
    title: t('routes.basic.login'),
  },
}

// Basic routing without permission
// 未经许可的基本路由
export const basicRoutes = [LoginRoute, RootRoute, REDIRECT_ROUTE, PAGE_NOT_FOUND_ROUTE]
