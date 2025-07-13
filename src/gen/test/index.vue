<template>
  <div class="container">
    <BreadCrumb :items="['模版名称']" />
    <a-card class="general-card" title="模版名称">
      <a-grid>
        <a-grid-item :span="22">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 8 }"
            :wrapper-col-props="{ span: 16 }"
            layout="inline"
            label-align="left"
          >
            <a-form-item field="name" label="模版名称">
              <a-input
                v-model="formModel.templateName"
                :placeholder="模版名称"
                allow-clear
              />
            </a-form-item>
            <a-form-item field="appId" label="模版ID">
              <a-input
                v-model="formModel.templateId"
                :placeholder="模版ID"
                allow-clear
              />
            </a-form-item>
            <a-form-item field="phone" label="模版手机号">
              <a-input
                v-model="formModel.templatePhone"
                :placeholder="模版手机号"
                allow-clear
              />
            </a-form-item>
            <a-form-item field="accessMethod" label="模版接入方式">
              <a-select
                v-model="formModel.accessMethod"
                :placeholder="模版接入方式"
                allow-clear
              >
                <a-option value="method1">接入方式1</a-option>
                <a-option value="method2">接入方式2</a-option>
              </a-select>
            </a-form-item>
          </a-form>
        </a-grid-item>
        <a-grid-item>
          <a-space direction="vertical" :size="18">
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              搜索
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              重置
            </a-button>
          </a-space>
        </a-grid-item>
      </a-grid>

      <a-divider style="margin-top: 16px" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="openCreateDialog">
              <template #icon>
                <icon-plus />
              </template>
              创建
            </a-button>
          </a-space>
        </a-col>
        <a-col
          :span="12"
          style="display: flex; align-items: center; justify-content: end"
        >
          <TableToolbar
            :size="size"
            :clone-columns="cloneColumns"
            :show-columns="showColumns"
            :density-list="densityList"
            @refresh="search"
            @select-density="handleSelectDensity"
            @change="handleChange"
            @popup-visible-change="popupVisibleChange"
          />
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="cloneColumns"
        :data="renderData"
        :bordered="false"
        :size="size"
        @page-change="onPageChange"
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 + (pagination.current - 1) * pagination.pageSize }}
        </template>
        <template #operations="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewDetail(record)">
              <template #icon>
                <icon-eye />
              </template>
            </a-button>
            <a-button type="text" size="small" @click="editRecord(record)">
              <template #icon>
                <icon-edit />
              </template>
            </a-button>
            <a-popconfirm content="删除模版" @ok="deleteRecord(record)">
              <a-button type="text" size="small" status="danger">
                <template #icon>
                  <icon-delete />
                </template>
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑/查看弹窗 -->
    <Dialog
      :visible="dialogVisible"
      @update:visible="(val) => (dialogVisible = val)"
      :mode="dialogMode"
      :record="dialogForm"
      @cancel="closeDialog"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { TableColumnData } from "@arco-design/web-vue/es/table/interface";
import { useTable } from "@/hooks/useTable";
import { useTableOperations } from "@/hooks/useTableOperations";
import axios from "axios";
import Dialog from "./components/Dialog.vue";

type Column = TableColumnData & { checked?: boolean };

// 生成表单模型
const generateFormModel = () => {
  return {};
};

const { t } = useI18n();
const formModel = ref(generateFormModel());

// 弹窗相关数据
const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit" | "view">("create");

// 对话框标题 - 已注释因为未使用
/*
const dialogTitle = computed(() => {
  if (dialogMode.value === 'create') return '新增'
  if (dialogMode.value === 'edit') return '编辑'
  return '查看'
})
*/
// const formRef = ref()

// 弹窗表单数据
const dialogForm = ref({});

// 初始化弹窗表单
const initDialogForm = () => {
  dialogForm.value = {};
};

// 获取数据
const fetchDataFn = async (params: any) => {
  return axios.post(`/api/eyeconfig/list`, { params });
};

const {
  loading,
  data: renderData,
  params,
  pagination,
  fetchData,
  onPageChange,
  search: searchData,
  reset: resetData,
} = useTable<any, any>(fetchDataFn, { current: 1, pageSize: 10 });

// 定义表格列
const columns = ref<Column[]>([
  {
    title: "名称",
    dataIndex: "name",
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: "应用id",
    dataIndex: "appId",
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: "手机号",
    dataIndex: "phone",
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: "访问方式",
    dataIndex: "accessMethod",
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: "版本",
    dataIndex: "version",
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: "管理区域",
    dataIndex: "managementArea",
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: "备注",
    dataIndex: "remarks",
    ellipsis: true,
    tooltip: true,
    width: 150,
  },
  {
    title: "操作",
    dataIndex: "operations",
    slotName: "operations",
    width: 120,
    fixed: "right",
  },
]);

// 搜索
const search = () => {
  Object.assign(params, {});
  searchData();
};

// 重置搜索条件
const reset = () => {
  formModel.value = generateFormModel();
  resetData();
};

// 打开新建弹窗
const openCreateDialog = () => {
  dialogMode.value = "create";
  initDialogForm();
  dialogVisible.value = true;
};

// 查看详情
const viewDetail = (record: any) => {
  dialogMode.value = "view";
  Object.assign(dialogForm.value, record);
  dialogVisible.value = true;
};

// 编辑记录
const editRecord = (record: any) => {
  dialogMode.value = "edit";
  Object.assign(dialogForm.value, record);
  dialogVisible.value = true;
};

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false;
};

// 处理对话框提交
const handleDialogSubmit = async (formData: Record<string, unknown>) => {
  try {
    const api =
      dialogMode.value === "create"
        ? "/api/eyeconfig/create"
        : "/api/eyeconfig/update";
    await axios.post(api, formData);
    closeDialog();
    refreshData();
  } catch (error) {
    console.error("表单提交失败", error);
  }
};

// 提交表单 - 已注释因为未使用
/*
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    // 提交数据
    await axios.post('/api/eyeconfig/create', dialogForm.value)
    Message.success('提交成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('提交失败', error)
  }
}
*/

// 删除记录
const deleteRecord = async (record: Record<string, unknown>) => {
  try {
    await axios.post("/api/eyeconfig/delete", { id: record.id });
    refreshData();
  } catch (error) {
    console.error("删除失败", error);
  }
};

// 使用 useTableOperations 钩子处理表格操作
const {
  size,
  cloneColumns,
  showColumns,
  densityList,
  handleSelectDensity,
  handleChange,
  popupVisibleChange,
  // refresh,
} = useTableOperations(
  () => columns.value,
  () => {}
);

// 自定义刷新函数
const refreshData = () => {
  fetchData();
};
</script>

<style scoped lang="less">
.container {
  padding: 10px;
}
</style>
