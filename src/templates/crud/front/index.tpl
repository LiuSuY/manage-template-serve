<template>
  <div class="container">
    <BreadCrumb :items="['NAMETEMPLATE']" />
    <a-card class="general-card" title="NAMETEMPLATE">
      <a-grid :cols="48" class="tw:w-full">
        <a-grid-item
          :span="{ xs: 48, sm: 48, md: 48, lg: 42, xl: 42, xxl: 44 }"
          class="tw:sm:mr-[0px] tw:md:mr-[0px] tw:lg:mr-[10px] tw:xl:mr-[10px] tw:xxl:mr-[10px]"
        >
          <a-form auto-label-width layout="horizontal" :model="formModel">
            <a-row :gutter="24">
              FORMTEMPLATE
            </a-row>
          </a-form>
        </a-grid-item>
        <a-grid-item
          :span="{ xs: 48, sm: 48, md: 48, lg: 6, xl: 6, xxl: 4 }"
          class="tw:flex tw:justify-end"
        >
          <a-space direction="vertical" :size="18" class="tw:!flex tw:w-full">
            <a-button type="primary" long @click="search">
              <template #icon>
                <icon-search />
              </template>
              搜索
            </a-button>
            <a-button long @click="reset">
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
import type { TableColumnData } from "@arco-design/web-vue/es/table/interface";
import { useTable } from "@/hooks/useTable";
import { useTableOperations } from "@/hooks/useTableOperations";

import Dialog from "./components/Dialog.vue";

type Column = TableColumnData & { checked?: boolean };

// 生成表单模型
const generateFormModel = () => {
  return FORMEMODELTEMPLATE;
};

RECORDS_TEMPLATE

PARAMS_TEMPLATE

const formModel = ref(generateFormModel());

// 弹窗相关数据
const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit" | "view">("create");

// 弹窗表单数据
const dialogForm = ref({});

// 初始化弹窗表单
const initDialogForm = () => {
  dialogForm.value = {};
};

// 获取数据
const fetchDataFn = async (params: IPARAMS) => {
  return alovaInstance.Post(`/inter/API_NAME/list`, { params });
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
} = useTable<IRECORD, IPARAMS>(fetchDataFn, { current: 1, pageSize: 10 });

// 定义表格列
const columns = ref<Column[]>(COLUMNSTEMPLATE);

// 搜索
const search = () => {
  Object.assign(params, formModel.value); // 将表单数据赋值给搜索参数
  searchData();
};

// 重置搜索条件
const reset = () => {
  formModel.value = generateFormModel();
  Object.assign(params, formModel.value); // 确保参数也被重置
  resetData();
};

// 打开新建弹窗
const openCreateDialog = () => {
  dialogMode.value = "create";
  initDialogForm();
  dialogVisible.value = true;
};

// 查看详情
const viewDetail = async (record: IRECORD) => {
  dialogMode.value = "view";
  const res = await alovaInstance.Get(`/inter/API_NAME/${record.id}`);
  Object.assign(dialogForm.value, res);
  dialogVisible.value = true;
};

// 编辑记录
const editRecord = (record: IRECORD) => {
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
        ? "/inter/API_NAME/create"
        : "/inter/API_NAME/update";
    await alovaInstance.Post(api, formData,  {tips: true});
    closeDialog();
    refreshData();
  } catch (error) {
    console.error("表单提交失败", error);
  }
};

// 删除记录
const deleteRecord = async (record: IRECORD) => {
  try {
    await alovaInstance.Post("/inter/API_NAME/delete", { id: record.id },{tips: true});
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

</style>
