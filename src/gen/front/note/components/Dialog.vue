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
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item
            field="id"
            label="id"
            :rules="[{ required: true, message: '请输入id' }]"
          >
            <a-input v-model="form.id" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
     
        <a-col :span="12">
          <a-form-item
            field="cate_id"
            label="公告分类ID"
            :rules="[{ required: true, message: '请输入公告分类ID' }]"
          >
            <a-input v-model="form.cate_id" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
     
        <a-col :span="12">
          <a-form-item
            field="title"
            label="标题"
            :rules="[{ required: true, message: '请输入标题' }]"
          >
            <a-input v-model="form.title" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
     
        <a-col :span="12">
          <a-form-item
            field="content"
            label="公告内容"
            :rules="[{ required: true, message: '请输入公告内容' }]"
          >
            <a-input v-model="form.content" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
     
        <a-col :span="12">
          <a-form-item
            field="src"
            label="关联链接"
            :rules="[{ required: true, message: '请输入关联链接' }]"
          >
            <a-input v-model="form.src" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
     
          <a-col :span="12">
            <a-form-item field="status" label="状态" :rules="[{ required: true, message: '请输入状态' }]">
              <a-select v-model="form.status" allow-clear placeholder="选择状态">
                            <a-option :value="1">可用</a-option><a-option :value="0">禁用</a-option>
              </a-select>
            </a-form-item>
          </a-col>
      
        <a-col :span="12">
          <a-form-item
            field="file_ids"
            label="相关附件"
            :rules="[{ required: true, message: '请输入相关附件' }]"
          >
            <a-input v-model="form.file_ids" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
     
          <a-col :span="12">
            <a-form-item field="role_type" label="查看权限" :rules="[{ required: true, message: '请输入查看权限' }]">
              <a-select v-model="form.role_type" allow-clear placeholder="选择查看权限">
                            <a-option :value="0">所有人</a-option><a-option :value="1">部门</a-option><a-option :value="2">人员</a-option>
              </a-select>
            </a-form-item>
          </a-col>
      
        <a-col :span="12">
          <a-form-item
            field="role_dids"
            label="可查看部门"
            :rules="[{ required: true, message: '请输入可查看部门' }]"
          >
            <a-input v-model="form.role_dids" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
     
        <a-col :span="12">
          <a-form-item
            field="role_uids"
            label="可查看用户"
            :rules="[{ required: true, message: '请输入可查看用户' }]"
          >
            <a-input v-model="form.role_uids" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
     <a-col :span="12">
                <a-form-item
                    field="start_time"
                    label="展示开始时间"
                    :rules="[{ required: true, message: '请输入展示开始时间' }]"
                  >
                    <a-date-picker
                                style="width: 100%"
                                show-time
                                v-model="form.start_time"
                                placeholder="请选择展示开始时间"
                                allow-clear
                              />
                  </a-form-item>
              </a-col>
          <a-col :span="12">
                <a-form-item
                    field="end_time"
                    label="展示结束时间"
                    :rules="[{ required: true, message: '请输入展示结束时间' }]"
                  >
                    <a-date-picker
                                style="width: 100%"
                                show-time
                                v-model="form.end_time"
                                placeholder="请选择展示结束时间"
                                allow-clear
                              />
                  </a-form-item>
              </a-col>
          
        <a-col :span="12">
          <a-form-item
            field="admin_id"
            label="发布人id"
            :rules="[{ required: true, message: '请输入发布人id' }]"
          >
            <a-input v-model="form.admin_id" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
     <a-col :span="12">
                <a-form-item
                    field="create_time"
                    label="create_time"
                    :rules="[{ required: true, message: '请输入create_time' }]"
                  >
                    <a-date-picker
                                style="width: 100%"
                                show-time
                                v-model="form.create_time"
                                placeholder="请选择"
                                allow-clear
                              />
                  </a-form-item>
              </a-col>
          <a-col :span="12">
                <a-form-item
                    field="update_time"
                    label="update_time"
                    :rules="[{ required: true, message: '请输入update_time' }]"
                  >
                    <a-date-picker
                                style="width: 100%"
                                show-time
                                v-model="form.update_time"
                                placeholder="请选择"
                                allow-clear
                              />
                  </a-form-item>
              </a-col>
          <a-col :span="12">
                <a-form-item
                    field="delete_time"
                    label="删除时间"
                    :rules="[{ required: true, message: '请输入删除时间' }]"
                  >
                    <a-date-picker
                                style="width: 100%"
                                show-time
                                v-model="form.delete_time"
                                placeholder="请选择删除时间"
                                allow-clear
                              />
                  </a-form-item>
              </a-col>
          </a-row> 
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
const form = ref({  id: "",
  cate_id: "",
  title: "",
  content: "",
  src: "",
  status: "",
  file_ids: "",
  role_type: "",
  role_dids: "",
  role_uids: "",
  start_time: "",
  end_time: "",
  admin_id: "",
  create_time: "",
  update_time: "",
  delete_time: "",
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
