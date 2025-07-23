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
    fields: Array<FieldInfo>
  ): Promise<string> {
    const templatePath = `${Deno.cwd()}/src/templates/crud/front/index.tpl`;
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
    // 生成模块名称
    result = result.replaceAll("NAMETEMPLATE", userData.name);
    const searchFormCode = this.generateSearchFormCode(fields);
    // 生成查询表单
    result = result.replace("FORMTEMPLATE", searchFormCode.join(""));
    // 生成table列
    result = result.replace("COLUMNSTEMPLATE", JSON.stringify(columns));
    // 生成表单默认值
    result = result.replace(
      "FORMEMODELTEMPLATE",
      this.generateFormValueCode(fields).join("")
    );
    // 生成表单查询参数
    result = result.replace(
      "PARAMS_TEMPLATE",
      this.generateInterfaceParamsCode(userData.module, fields)
    );
    // 生成表单返回值
    result = result.replace(
      "RECORDS_TEMPLATE",
      this.generateInterfaceRecordCode(userData.module, fields)
    );

    // 生成返回值接口
    result = result.replace(
      "IRECORD",
      this.generateInterfaceName(userData.module, "Record")
    );
    // 生成查询参数接口
    result = result.replace(
      "IPARAMS",
      this.generateInterfaceName(userData.module, "Params")
    );

    // 生成API名称
    result = result.replaceAll("API_NAME", userData.module);

    return result;
  }

  private static generateInterfaceName(name: string, key: string = "Params") {
    // 生成接口名称，首字母大写
    const interfaceName = name.charAt(0).toUpperCase() + name.slice(1) + key;

    return `I${interfaceName}`;
  }

  private static generateInterfaceParamsCode(
    name: string,
    fields: Array<FieldInfo>
  ) {
    // 生成接口名称，首字母大写
    const interfaceName =
      name.charAt(0).toUpperCase() + name.slice(1) + "Params";

    // 开始接口定义
    const lines = [`interface I${interfaceName} {`];

    // 为每个字段生成一行，搜索参数通常是可选的
    fields.forEach((field) => {
      // 排除一些不适合作为搜索参数的字段
      if (!["id", "createTime", "updateTime"].includes(field.COLUMN_NAME)) {
        lines.push(`  ${field.COLUMN_NAME}?: string;`);
      }
    });

    // 添加分页参数
    lines.push("  current: number;");
    lines.push("  pageSize: number;");
    // 添加排序参数
    lines.push("  [key: string]: unknown;");

    // 结束接口定义
    lines.push("}");

    return lines.join("\n");
  }

  // 生成interface代码
  private static generateInterfaceRecordCode(
    name: string,
    fields: Array<FieldInfo>
  ) {
    // 生成接口名称，首字母大写
    const interfaceName =
      name.charAt(0).toUpperCase() + name.slice(1) + "Record";

    // 开始接口定义
    const lines = [`interface I${interfaceName} {`];

    // 为每个字段生成一行
    fields.forEach((field) => {
      // 确定字段类型
      let fieldType = "string";
      if (
        field.DATA_TYPE === "int" ||
        field.DATA_TYPE === "tinyint" ||
        field.DATA_TYPE === "bigint" ||
        field.DATA_TYPE === "decimal"
      ) {
        fieldType = "number";
      } else if (
        field.DATA_TYPE === "datetime" ||
        field.DATA_TYPE === "timestamp"
      ) {
        fieldType = "string"; // 日期通常以字符串形式返回
      } else if (field.DATA_TYPE === "boolean" || field.DATA_TYPE === "bit") {
        fieldType = "boolean";
      }

      // 添加字段定义
      lines.push(`  ${field.COLUMN_NAME}: ${fieldType};`);
    });

    // 结束接口定义
    lines.push("}");

    return lines.join("\n");
  }

  // 生成对话框Vue文件
  static async generateDialogVue(fields: Array<FieldInfo>): Promise<string> {
    const templatePath = `${Deno.cwd()}/src/templates/crud/front/components/dialog.tpl`;
    const template = await this.readTemplate(templatePath);
    const dialogFormCode = this.generateDialogFormCode(fields);
    let result = template.replace(
      "DIALOGFORMTEMPLATE",
      dialogFormCode.join("")
    );
    const dialogFormValueCode = this.generateFormValueCode(fields);
    result = result.replace(
      "DIALOGFORMTEVALUEMPLATE",
      dialogFormValueCode.join("")
    );
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

  // 生成表单默认值代码
  private static generateFormValueCode(fields: Array<FieldInfo>): string[] {
    // 开始和结束括号
    const lines = ["{"];

    // 为每个字段生成一行
    fields.forEach((field, index) => {
      const isLast = index === fields.length - 1;
      const fieldName = field.COLUMN_NAME;
      lines.push(`  ${fieldName}: "",${isLast ? "\n" : "\n"}`);
    });

    // 添加结束括号
    lines.push("}");

    return lines;
  }
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
        <a-select v-model="form.${
          field.COLUMN_NAME
        }" allow-clear placeholder="选择${this.genSelectName(field)}">
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
                    placeholder="请输入${
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
    const templatePath = `${Deno.cwd()}/src/templates/crud/front/locale/${lang}.ts`;
    const template = await this.readTemplate(templatePath);

    // 将现有模板中的硬编码内容替换为动态内容
    let result = template;
    return result;
  }

  // 生成Controller文件
  static async generateController(
    userData: CreateCrudData,
    fields: Array<FieldInfo>
  ): Promise<string> {
    const { module } = userData;
    const capitalizedModule = module.charAt(0).toUpperCase() + module.slice(1);
    
    const templatePath = `${Deno.cwd()}/src/templates/crud/back/controller.tpl`;
    const template = await this.readTemplate(templatePath);
    
    // 替换模板中的变量
    return template
      .replaceAll("${capitalizedModule}", capitalizedModule)
      .replaceAll("${module}", module);
  }

  // 生成Service文件
  static async generateService(
    userData: CreateCrudData,
    fields: Array<FieldInfo>
  ): Promise<string> {
    const { module, table } = userData;
    const capitalizedModule = module.charAt(0).toUpperCase() + module.slice(1);

    // 生成字段列表
    const fieldNames = fields.map((f) => f.COLUMN_NAME).join(", ");
    const insertFields = fields
      .filter((f) => f.COLUMN_NAME !== "id")
      .map((f) => f.COLUMN_NAME)
      .join(", ");
    const insertPlaceholders = fields
      .filter((f) => f.COLUMN_NAME !== "id")
      .map(() => "?")
      .join(", ");
    const insertParams = fields
      .filter((f) => f.COLUMN_NAME !== "id")
      .map((f) => `userData.${f.COLUMN_NAME}`)
      .join(",\n      ");

    const templatePath = `${Deno.cwd()}/src/templates/crud/back/service.tpl`;
    const template = await this.readTemplate(templatePath);
    
    // 替换模板中的变量
    return template
      .replaceAll("${capitalizedModule}", capitalizedModule)
      .replaceAll("${module}", module)
      .replaceAll("${table}", table)
      .replaceAll("${fieldNames}", fieldNames)
      .replaceAll("${insertFields}", insertFields)
      .replaceAll("${insertPlaceholders}", insertPlaceholders)
      .replaceAll("${insertParams}", insertParams)
      .replaceAll("${search}", "search"); // 处理模板中的 ${search} 变量
  }

  // 生成Type文件
  static async generateTypes(
    userData: CreateCrudData,
    fields: Array<FieldInfo>
  ): Promise<string> {
    const { module } = userData;
    const capitalizedModule = module.charAt(0).toUpperCase() + module.slice(1);

    // 生成基础接口
    const baseInterface = this.generateInterfaceRecordCode(module, fields);

    // 生成创建数据接口（排除id和时间戳字段）
    const createFields = fields.filter(
      (f) => !["id", "created_at", "updated_at"].includes(f.COLUMN_NAME)
    );
    const createInterface = this.generateInterfaceRecordCode(
      module + "Create",
      createFields
    ).replace(module + "CreateRecord", `Create${capitalizedModule}Data`);

    // 生成更新数据接口（所有字段都是可选的，排除id）
    const updateFields = fields.filter((f) => f.COLUMN_NAME !== "id");
    const updateInterface = updateFields
      .map((field) => {
        let fieldType = "string";
        if (
          field.DATA_TYPE === "int" ||
          field.DATA_TYPE === "tinyint" ||
          field.DATA_TYPE === "bigint" ||
          field.DATA_TYPE === "decimal"
        ) {
          fieldType = "number";
        } else if (field.DATA_TYPE === "boolean" || field.DATA_TYPE === "bit") {
          fieldType = "boolean";
        }
        return `  ${field.COLUMN_NAME}?: ${fieldType};`;
      })
      .join("\n");

    const templatePath = `${Deno.cwd()}/src/templates/crud/back/type.tpl`;
    const template = await this.readTemplate(templatePath);
    
    // 替换模板中的变量
    return template
      .replaceAll("${capitalizedModule}", capitalizedModule)
      .replaceAll("${baseInterface}", baseInterface)
      .replaceAll("${createInterface}", createInterface)
      .replaceAll("${updateInterface}", updateInterface);
  }

  // 生成Validator文件
  static async generateValidator(
    userData: CreateCrudData,
    fields: Array<FieldInfo>
  ): Promise<string> {
    const { module } = userData;
    const capitalizedModule = module.charAt(0).toUpperCase() + module.slice(1);

    // 生成创建验证schema
    const createFields = fields.filter(
      (f) => !["id", "created_at", "updated_at"].includes(f.COLUMN_NAME)
    );
    const createValidation = createFields
      .map((field) => {
        // 现有的验证逻辑
        // ...
      })
      .join("\n");

    // 生成更新验证schema
    const updateFields = fields.filter((f) => f.COLUMN_NAME !== "id");
    const updateValidation = updateFields
      .map((field) => {
        // 现有的验证逻辑
        // ...
      })
      .join("\n");

    const templatePath = `${Deno.cwd()}/src/templates/crud/back/validator.tpl`;
    const template = await this.readTemplate(templatePath);
    
    // 替换模板中的变量
    return template
      .replaceAll("${capitalizedModule}", capitalizedModule)
      .replaceAll("${createValidation}", createValidation)
      .replaceAll("${updateValidation}", updateValidation);
  }

  // 生成Router文件
  static async generateRouter(
    userData: CreateCrudData,
    fields: Array<FieldInfo>
  ): Promise<string> {
    const { module } = userData;
    const capitalizedModule = module.charAt(0).toUpperCase() + module.slice(1);

    const templatePath = `${Deno.cwd()}/src/templates/crud/back/router.tpl`;
    const template = await this.readTemplate(templatePath);
    
    // 替换模板中的变量
    return template
      .replaceAll("${capitalizedModule}", capitalizedModule)
      .replaceAll("${module}", module);
  }
}
