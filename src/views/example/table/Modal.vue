<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #itemSlot="{ model, field }">
        <ApiSelect
          :api="getDeptList"
          showSearch
          v-model:value="model[field]"
          :filterOption="false"
          resultField="result"
          labelField="remark"
          valueField="orderNo"
          :params="searchParams"
          @search="onSearch"
          placeholder="项目名称"
        />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue'
  import { BasicModal, useModalInner } from '/@/components/Modal'
  import { BasicForm, useForm } from '/@/components/Form/index'
  import { formSchema } from './data'
  import { ApiSelect } from '/@/components/Form'

  import { getDeptList } from '/@/api/demo/system'

  const emits = defineEmits(['success', 'register'])

  const isUpdate = ref(true)

  const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
  })

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields()
    setModalProps({ confirmLoading: false })
    isUpdate.value = !!data?.isUpdate

    if (unref(isUpdate)) {
      await setFieldsValue({
        ...data.record,
      })
    }
    const treeData = await getDeptList()
    await updateSchema({
      field: 'parentDept',
      componentProps: { treeData },
    })
  })

  const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'))

  async function handleSubmit() {
    try {
      const values = await validate()
      setModalProps({ confirmLoading: true })
      //TODO: custom api
      console.log(values)
      closeModal()
      emits('success')
    } finally {
      setModalProps({ confirmLoading: false })
    }
  }

  const keyword = ref<string>('')

  function onSearch(value: string) {
    keyword.value = value
  }

  const searchParams = computed<Recordable>(() => {
    return {
      operateStatus: 0,
      size: 500,
      search: unref(keyword),
    }
  })
</script>
