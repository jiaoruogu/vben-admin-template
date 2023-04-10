import { AppRouteModule } from '/@/router/types'
import { LAYOUT } from '/@/router/constant'

const example: AppRouteModule = {
  path: '/example',
  name: 'Example',
  component: LAYOUT,
  redirect: '/example/table',
  meta: {
    orderNo: 11,
    icon: 'mdi:hexagon-multiple',
    title: '例子',
  },
  children: [
    {
      path: 'table',
      name: 'Table',
      component: () => import('/@/views/example/table/index.vue'),
      meta: {
        title: '列表',
      },
    },
  ],
}

export default example
