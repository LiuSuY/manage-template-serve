<template>
  <div class="container">
    <BreadCrumb :items="['测试']" />
    <a-card class="general-card" title="测试">
      <a-grid :cols="48" class="tw:w-full">
        <a-grid-item
          :span="{ xs: 48, sm: 48, md: 48, lg: 42, xl: 42, xxl: 44 }"
          class="tw:sm:mr-[0px] tw:md:mr-[0px] tw:lg:mr-[10px] tw:xl:mr-[10px] tw:xxl:mr-[10px]"
        >
          <a-form auto-label-width layout="horizontal" :model="formModel">
            <a-row :gutter="24">
              <a-col   
                :xs="{ span: 24 }"
                :sm="{ span: 24 }"
                :md="{ span: 24 }"
                :lg="{ span: 8 }"
                :xl="{ span: 6 }"
                :xxl="{ span: 6 }"
              >
                <a-form-item field="id" label="id">
                  <a-input
                    v-model="formModel.id"
                    :placeholder="请输入id"
                    allow-clear
                  />
                </a-form-item>
              </a-col><a-col   
                :xs="{ span: 24 }"
                :sm="{ span: 24 }"
                :md="{ span: 24 }"
                :lg="{ span: 8 }"
                :xl="{ span: 6 }"
                :xxl="{ span: 6 }"
              >
                <a-form-item field="title" label="工作类型名称">
                  <a-input
                    v-model="formModel.title"
                    :placeholder="请输入工作类型名称"
                    allow-clear
                  />
                </a-form-item>
              </a-col><a-col   
                :xs="{ span: 24 }"
                :sm="{ span: 24 }"
                :md="{ span: 24 }"
                :lg="{ span: 8 }"
                :xl="{ span: 6 }"
                :xxl="{ span: 6 }"
              >
                <a-form-item field="sort" label="排序">
                  <a-input
                    v-model="formModel.sort"
                    :placeholder="请输入排序"
                    allow-clear
                  />
                </a-form-item>
              </a-col><a-col   
                  :xs="{ span: 24 }"
                  :sm="{ span: 24 }"
                  :md="{ span: 24 }"
                  :lg="{ span: 8 }"
                  :xl="{ span: 6 }"
                  :xxl="{ span: 6 }"
                >
                  <a-form-item field="status" label="状态" placeholder="选择状态">
                    <a-select v-model="formModel.status" allow-clear>
                      <a-option value="-1">删除</a-option><a-option value="0">禁用</a-option><a-option value="1">启用</a-option>
                    </a-select>
                  </a-form-item>
                </a-col><a-col   
                :xs="{ span: 24 }"
                :sm="{ span: 24 }"
                :md="{ span: 24 }"
                :lg="{ span: 8 }"
                :xl="{ span: 6 }"
                :xxl="{ span: 6 }"
              >
                <a-form-item field="create_time" label="创建时间">
                  <a-input
                    v-model="formModel.create_time"
                    :placeholder="请输入创建时间"
                    allow-clear
                  />
                </a-form-item>
              </a-col><a-col   
                :xs="{ span: 24 }"
                :sm="{ span: 24 }"
                :md="{ span: 24 }"
                :lg="{ span: 8 }"
                :xl="{ span: 6 }"
                :xxl="{ span: 6 }"
              >
                <a-form-item field="update_time" label="更新时间">
                  <a-input
                    v-model="formModel.update_time"
                    :placeholder="请输入更新时间"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
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
const columns = ref<Column[]>([{"title":"id","dataIndex":"id","key":"id","ellipsis":true,"tooltip":true,"width":150},{"title":"工作类型名称","dataIndex":"title","key":"title","ellipsis":true,"tooltip":true,"width":150},{"title":"排序","dataIndex":"sort","key":"sort","ellipsis":true,"tooltip":true,"width":150},{"title":"状态","dataIndex":"status","key":"status","ellipsis":true,"tooltip":true,"width":150},{"title":"创建时间","dataIndex":"create_time","key":"create_time","ellipsis":true,"tooltip":true,"width":150},{"title":"更新时间","dataIndex":"update_time","key":"update_time","ellipsis":true,"tooltip":true,"width":150},{"title":"操作","dataIndex":"operations","slotName":"operations","width":120,"fixed":"right"}]);

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

.container {
  padding: 10px;
}
:deep(.container .general-card > .arco-card-body) {
    padding: 10px;
}
:deep(.general-card > .arco-card-header) {
    padding: 10px;
}
</style>
