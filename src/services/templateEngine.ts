import { CreateCrudData } from "../types/crud.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

export interface FieldInfo {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  CHARACTER_MAXIMUM_LENGTH?: number;
  IS_NULLABLE: string;
  COLUMN_DEFAULT?: unknown;
  COLUMN_COMMENT?: string;
}

export interface ColumnInfo {
  slotName?: string;
  fixed?: string;
  title: string;
  dataIndex: string;
  key?: string;
  ellipsis?: boolean;
  tooltip?: boolean;
  width: number;
}

export class TemplateEngine {
  // 读取模板文件
  private static async readTemplate(templatePath: string): Promise<string> {
    try {
      return await Deno.readTextFile(templatePath);
    } catch (error) {
      throw new Error(`无法读取模板文件: ${templatePath}`);
    }
  }

  // 生成index.vue文件
  static async generateIndexVue(
    userData: CreateCrudData,
    fields: Array<FieldInfo>,
    name: string
  ): Promise<string> {
    const templatePath = `${Deno.cwd()}/src/templates/crud/index.tpl`;
    const template = await this.readTemplate(templatePath);
    let result = template;

    const columns: Array<ColumnInfo> = fields.map((field) => ({
      title: this.genSelectName(field),
      dataIndex: field?.COLUMN_NAME,
      key: field?.COLUMN_NAME,
      ellipsis: true,
      tooltip: true,
      width: 150,
    }));

    columns.push({
      title: "操作",
      dataIndex: "operations",
      slotName: "operations",
      width: 120,
      fixed: "right",
    });
    result = result.replaceAll("NAMETEMPLATE", name);
    const searchFormCode = this.generateSearchFormCode(fields);
    result = result.replace("FORMTEMPLATE", searchFormCode.join(""));
    result = result.replace("COLUMNSTEMPLATE", JSON.stringify(columns));
    return result;
  }

  // 生成接口代码
  private static generateInterfaceCode() {}

  // 生成对话框Vue文件
  static async generateDialogVue(fields: Array<FieldInfo>): Promise<string> {
    const templatePath = `${Deno.cwd()}/src/templates/crud/components/dialog.vue`;
    const template = await this.readTemplate(templatePath);
    const dialogFormCode = this.generateDialogFormCode(fields);
    let result = template.replace("DIALOGFORMTEMPLATE", dialogFormCode.join(""));
    // 将现有模板中的硬编码内容替换为动态内容
    return result;
  }

  private static generateSelectOptions(field: FieldInfo) {
    const comment = field?.COLUMN_COMMENT;
    if (comment) {
      // 使用正则表达式同时匹配中英文冒号
      const match = comment.split(/[：:]/)[1];
      if (match) {
        return this.convertArray([match]).map((item) => {
          return `<a-option value="${item[0]}">${item[1]}</a-option>`;
        });
      }
    }
  }
  private static convertArray(input: string[]): string[][] {
    // 取出数组中的第一个字符串
    const str = input[0];
    // 定义正则表达式，匹配数字和中文描述
    const regex = /(-?\d+)([\u4e00-\u9fa5]+)/g;
    const result: string[][] = [];
    let match;
    // 循环匹配所有符合条件的内容
    while ((match = regex.exec(str)) !== null) {
      result.push([match[1], match[2]]);
    }
    return result;
  }

  private static genSelectName = (field: FieldInfo) => {
    if (field?.DATA_TYPE === "tinyint") {
      const comment = field?.COLUMN_COMMENT;
      if (comment) {
        // 使用正则表达式同时匹配中英文冒号
        const match = comment.split(/[：:]/)[0];
        if (match && match !== comment) {
          return match;
        }
      }
      return "状态";
    }
    if (field?.COLUMN_COMMENT) {
      return field?.COLUMN_COMMENT;
    }
    return field?.COLUMN_NAME;
  };

  //生成对话框表单代码
  private static generateDialogFormCode(fields: Array<FieldInfo>): string[] {
    return fields.map((field: FieldInfo) => {
      if (field.DATA_TYPE === "tinyint") {
        return `<a-form-item field="${
          field.COLUMN_NAME
        }" label="${this.genSelectName(
          field
        )}" :rules="[{ required: true, message: '请输入${this.genSelectName(
          field
        )}' }]">
        <a-select v-model="form.${field.COLUMN_NAME}" allow-clear placeholder="选择${this.genSelectName(field)}">
                      ${this.generateSelectOptions(field)?.join("")}
        </a-select>
       </a-form-item>
      `;
      }
      // 这里可以根据字段类型生成不同的表单项
      return `<a-form-item
        field="${field.COLUMN_NAME}"
        label="${this.genSelectName(field)}"
        :rules="[{ required: true, message: '请输入${this.genSelectName(
          field
        )}' }]"
      >
        <a-input v-model="form.${
          field.COLUMN_NAME
        }" placeholder="请输入" allow-clear />
      </a-form-item>
     `;
    });
  }

  // 生成搜索框表单代码
  private static generateSearchFormCode(fields: Array<FieldInfo>): string[] {
    return fields.map((field: FieldInfo) => {
      if (field.DATA_TYPE === "tinyint") {
        return `<a-col   
                  :xs="{ span: 24 }"
                  :sm="{ span: 24 }"
                  :md="{ span: 24 }"
                  :lg="{ span: 8 }"
                  :xl="{ span: 6 }"
                  :xxl="{ span: 6 }"
                >
                  <a-form-item field="${
                    field.COLUMN_NAME
                  }" label="${this.genSelectName(
          field
        )}" placeholder="选择${this.genSelectName(field)}">
                    <a-select v-model="formModel.${
                      field.COLUMN_NAME
                    }" allow-clear>
                      ${this.generateSelectOptions(field)?.join("")}
                    </a-select>
                  </a-form-item>
                </a-col>`;
      }
      // 这里可以根据字段类型生成不同的表单项
      return `<a-col   
                :xs="{ span: 24 }"
                :sm="{ span: 24 }"
                :md="{ span: 24 }"
                :lg="{ span: 8 }"
                :xl="{ span: 6 }"
                :xxl="{ span: 6 }"
              >
                <a-form-item field="${field.COLUMN_NAME}" label="${
        field.COLUMN_COMMENT || field.COLUMN_NAME
      }">
                  <a-input
                    v-model="formModel.${field.COLUMN_NAME}"
                    :placeholder="请输入${
                      field.COLUMN_COMMENT || field.COLUMN_NAME
                    }"
                    allow-clear
                  />
                </a-form-item>
              </a-col>`;
    });
  }

  // 生成语言
  private static async generateLocale(
    fields: string[],
    lang: string
  ): Promise<string> {
    const templatePath = `${Deno.cwd()}/src/templates/crud/locale/${lang}.ts`;
    const template = await this.readTemplate(templatePath);

    // 将现有模板中的硬编码内容替换为动态内容
    let result = template;
    return result;
  }
}
