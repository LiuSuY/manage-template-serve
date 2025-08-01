<template>
  <a-modal
    :visible="visible"
    :title="title"
    :mask-closable="false"
    :footer="mode === 'view' ? false : true"
    @cancel="handleCancel"
    @ok="handleSubmit"
    popup-container="#model"
    @update:visible="updateVisible"
    modal-class="model-dialog"
    width="50%"
  >
    <a-form
      ref="formRef"
      :model="form"
      :disabled="mode === 'view'"
      label-align="right"
      auto-label-width
      @submit="handleFormSubmit"
    >
      DIALOGFORMTEMPLATE 
    </a-form>

    <template #footer>
      <div v-if="mode !== 'view'">
        <a-space>
          <a-button @click="handleCancel">
            取消
          </a-button>
          <a-button type="primary" @click="handleSubmit">
            保存
          </a-button>
        </a-space>
      </div>
      <div v-else>
        <a-button type="primary" @click="handleCancel">
          关闭
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
// 定义组件的属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String as () => "create" | "edit" | "view",
    default: "create",
  },
  record: {
    type: Object,
    default: () => ({}),
  },
});

// 定义组件的事件
const emit = defineEmits(["update:visible", "cancel", "submit"]);

// 计算属性：对话框标题
const title = computed(() => {
  if (props.mode === "create") return "创建";
  if (props.mode === "edit") return "编辑";
  return "查看";
});

// 表单引用
const formRef = ref();

// 表单数据
const form = ref(DIALOGFORMTEVALUEMPLATE);

// 监听record变化，更新表单数据
watch(
  () => props.record,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      Object.assign(form.value, newVal);
    }
  },
  { immediate: true, deep: true }
);

// 监听visible变化，重置表单
// 监听visible变化，重置表单
watch(
  () => props.visible,
  () => {
    // 关闭弹窗时重置表单
    if (props.mode === "create") {
      resetForm();
    }
  }
);

// 重置表单
const resetForm = () => {
  // 重置表单
  formRef.value?.resetFields();
};

// 更新可见状态
const updateVisible = (val: boolean) => {
  emit("update:visible", val);
};

// 取消按钮点击事件
const handleCancel = () => {
  emit("update:visible", false);
  emit("cancel");
};

// 提交表单
const handleSubmit = () => {
  if (!formRef.value) return;
  formRef.value.handleSubmit();
};
// 提交表单
const handleFormSubmit = async({values, errors}) => {
  try {
    if(errors){
      return false
    }
    emit("submit", { ...values });
    return true;
  } catch (error) {
    console.error("表单验证失败", error);
    return false;
  }
}
</script>

<style scoped lang="less">

</style>
