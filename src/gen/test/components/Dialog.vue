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
  >
    <a-form
      ref="formRef"
      :model="form"
      :disabled="mode === 'view'"
      label-align="right"
      auto-label-width
    >
      <a-form-item
        field="id"
        label="id"
        :rules="[{ required: true, message: '请输入id' }]"
      >
        <a-input v-model="form.id" placeholder="请输入" allow-clear />
      </a-form-item>
     <a-form-item
        field="title"
        label="工作类型名称"
        :rules="[{ required: true, message: '请输入工作类型名称' }]"
      >
        <a-input v-model="form.title" placeholder="请输入" allow-clear />
      </a-form-item>
     <a-form-item
        field="sort"
        label="排序"
        :rules="[{ required: true, message: '请输入排序' }]"
      >
        <a-input v-model="form.sort" placeholder="请输入" allow-clear />
      </a-form-item>
     <a-form-item field="status" label="状态" :rules="[{ required: true, message: '请输入状态' }]">
        <a-select v-model="form.status" allow-clear placeholder="选择状态">
                      <a-option value="-1">删除</a-option><a-option value="0">禁用</a-option><a-option value="1">启用</a-option>
        </a-select>
       </a-form-item>
      <a-form-item
        field="create_time"
        label="创建时间"
        :rules="[{ required: true, message: '请输入创建时间' }]"
      >
        <a-input v-model="form.create_time" placeholder="请输入" allow-clear />
      </a-form-item>
     <a-form-item
        field="update_time"
        label="更新时间"
        :rules="[{ required: true, message: '请输入更新时间' }]"
      >
        <a-input v-model="form.update_time" placeholder="请输入" allow-clear />
      </a-form-item>
      
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
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
const form = ref({
  
});

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
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      // 关闭弹窗时重置表单
      if (props.mode === "create") {
        resetForm();
      }
    }
  }
);

// 重置表单
const resetForm = () => {
  form.value = {
    
  };
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
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit("submit", { ...form.value });
    return true;
  } catch (error) {
    console.error("表单验证失败", error);
    return false;
  }
};
</script>

<style scoped lang="less">

</style>
