<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 新增 </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <Modal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction } from '/@/components/Table'
  import { getDeptList } from '/@/api/demo/system'

  import { useModal } from '/@/components/Modal'
  import Modal from './Modal.vue'

  import { columns, searchFormSchema } from './data'

  const [registerModal, { openModal }] = useModal()
  const [registerTable, { reload }] = useTable({
    title: '列表Title',
    api: getDeptList,
    afterFetch: (res) => {
      // 过滤接口请求回来的参数
      return res.map(({ children, ...rest }) => rest)
    },
    columns,
    formConfig: {
      labelWidth: 120,
      schemas: searchFormSchema,
      fieldMapToTime: [['rangeTime', ['startTime', 'endTime'], 'YYYY-MM-DD hh:mm:ss']],
    },
    pagination: true,
    striped: false,
    useSearchForm: true,
    showTableSetting: true,
    bordered: true,
    showIndexColumn: false,
    canResize: false,
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      // slots: { customRender: 'action' },
      fixed: undefined,
    },
  })

  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    })
  }

  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
    })
  }

  function handleDelete(record: Recordable) {
    console.log(record)
  }

  function handleSuccess() {
    reload()
  }
</script>
