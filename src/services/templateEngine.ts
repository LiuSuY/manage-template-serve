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
    result = result.replaceAll(
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

    // // 为每个字段生成一行，搜索参数通常是可选的
    // fields.forEach((field) => {
    //   // 排除一些不适合作为搜索参数的字段
    //   if (!["createTime", "updateTime"].includes(field.COLUMN_NAME)) {
    //     lines.push(`  ${field.COLUMN_NAME}?: string;`);
    //   }
    // });

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
    let result = "";
    if (fields.length >= 8) {
      result = template.replace(
        "DIALOGFORMTEMPLATE",
        `<a-row :gutter="24">${dialogFormCode.join("")}</a-row>`
      );
    } else {
      result = template.replace("DIALOGFORMTEMPLATE", dialogFormCode.join(""));
    }

    const dialogFormValueCode = this.generateFormValueCode(fields);
    result = result.replace(
      "DIALOGFORMTEVALUEMPLATE",
      dialogFormValueCode.join("")
    );
    // 将现有模板中的硬编码内容替换为动态内容
    return result;
  }

  private static generateSelectOptions(field: FieldInfo) {
    const comment = field.COLUMN_COMMENT;
    if (comment) {
      // 使用正则表达式同时匹配中英文冒号
      const match = comment.split(/[：:]/)[1];
      if (match) {
        return this.convertArray([match]).map((item) => {
          return `<a-option :value="${item[0]}">${item[1]}</a-option>`;
        });
      }
      return `<a-option value="-10">自定</a-option>`;
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
    if (field.COLUMN_COMMENT && /[：:].*\d/.test(field.COLUMN_COMMENT)) {
      const comment = field.COLUMN_COMMENT;
      if (comment) {
        // 使用正则表达式同时匹配中英文冒号
        const match = comment.split(/[：:]/)[0];
        if (match && match !== comment) {
          return match;
        }
      }
      return field.COLUMN_NAME;
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
    if (fields.length >= 8) {
      return fields.map((field: FieldInfo) => {
        // 使用正则表达式判断注释是否包含中英文冒号和数字（表示有选项配置）
        if (field.COLUMN_COMMENT && /[：:].*\d/.test(field.COLUMN_COMMENT)) {
          return `
          <a-col :span="12">
            <a-form-item field="${
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
          </a-col>
      `;
        }

        if (field.COLUMN_NAME.includes("_time")) {
          return `<a-col :span="12">
                <a-form-item
                    field="${field.COLUMN_NAME}"
                    label="${this.genSelectName(field)}"
                    :rules="[{ required: true, message: '请输入${this.genSelectName(
                      field
                    )}' }]"
                  >
                    <a-date-picker
                                style="width: 100%"
                                show-time
                                v-model="form.${field.COLUMN_NAME}"
                                placeholder="请选择${field.COLUMN_COMMENT}"
                                allow-clear
                              />
                  </a-form-item>
              </a-col>
          `;
        }
        // 这里可以根据字段类型生成不同的表单项
        return `
        <a-col :span="12">
          <a-form-item
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
        </a-col>
     `;
      });
    }
    return fields.map((field: FieldInfo) => {
      // 使用正则表达式判断注释是否包含中英文冒号和数字（表示有选项配置）
      if (field.COLUMN_COMMENT && /[：:].*\d/.test(field.COLUMN_COMMENT)) {
        return `<a-form-item field="${
          field.COLUMN_NAME
        }" label="${this.genSelectName(
          field
        )}" :rules="[{ required: true, message: '请输入${this.genSelectName(
          field
        )}' }]">
        <a-select v-model="form.${
          field.COLUMN_NAME
        }" allow-clear placeholder="请选择${this.genSelectName(field)}">
                     ${this.generateSelectOptions(field)?.join("")}
        </a-select>
       </a-form-item>
      `;
      }

      if (field.COLUMN_NAME.includes("_time")) {
        return ` <a-form-item
                field="${field.COLUMN_NAME}"
                label="${this.genSelectName(field)}"
                :rules="[{ required: true, message: '请选择${this.genSelectName(
                  field
                )}' }]"
              >
                <a-date-picker
                            style="width: 100%"
                            show-time
                            v-model="form.${field.COLUMN_NAME}"
                            placeholder="请选择${field.COLUMN_COMMENT}"
                            allow-clear
                          />
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
      // 使用正则表达式判断注释是否包含中英文冒号和数字（表示有选项配置）
      if (field.COLUMN_COMMENT && /[：:].*\d/.test(field.COLUMN_COMMENT)) {
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
        )}" placeholder="请选择${this.genSelectName(field)}">
                    <a-select v-model="formModel.${
                      field.COLUMN_NAME
                    }" allow-clear>
                      ${this.generateSelectOptions(field)?.join("")}
                    </a-select>
                  </a-form-item>
                </a-col>`;
      }
      if (field.COLUMN_NAME.includes("_time")) {
        return `<a-col   
                :xs="{ span: 24 }"
                :sm="{ span: 24 }"
                :md="{ span: 24 }"
                :lg="{ span: 8 }"
                :xl="{ span: 6 }"
                :xxl="{ span: 6 }"
              >
                <a-form-item field="${field.COLUMN_NAME}" label="${
          field.COLUMN_COMMENT == "" ? field.COLUMN_NAME : field.COLUMN_COMMENT
        }">
                  <a-date-picker
                    style="width: 100%"
                    show-time
                    v-model="formModel.${field.COLUMN_NAME}"
                    placeholder="请选择${field.COLUMN_COMMENT}"
                    allow-clear
                  />
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
        field.COLUMN_COMMENT == "" ? field.COLUMN_NAME : field.COLUMN_COMMENT
      }">
                  <a-input
                    v-model="formModel.${field.COLUMN_NAME}"
                    placeholder="请输入${field.COLUMN_COMMENT}"
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
    const templatePath = `${Deno.cwd()}/src/templates/crud/front/locale/${lang}.tpl`;
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
      .map((f) => `convertedData.${f.COLUMN_NAME}`)
      .join(",\n      ");

    // 生成搜索字段（通常是文本类型的字段）
    const searchableFields = fields.filter(
      (f) =>
        ["varchar", "text", "longtext", "char"].includes(f.DATA_TYPE) &&
        !["id", "created_at", "updated_at", "delete_time"].includes(
          f.COLUMN_NAME
        )
    );

    const searchFields =
      searchableFields.length > 0
        ? searchableFields.map((f) => `${f.COLUMN_NAME} LIKE ?`).join(" OR ")
        : "id = id"; // 默认条件，避免空字符串

    const searchFieldsCount = searchableFields.length;

    // 生成允许查询的字段列表（白名单）
    const allowedFields = fields
      .map((f) => f.COLUMN_NAME)
      .map((name) => `'${name}'`)
      .join(", ");

    // 生成文本字段列表（用于模糊查询）
    const textFields = fields
      .filter((f) => ["varchar", "text", "longtext", "char"].includes(f.DATA_TYPE))
      .map((f) => f.COLUMN_NAME)
      .map((name) => `'${name}'`)
      .join(", ");

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
      .replaceAll("${searchFields}", searchFields)
      .replaceAll("${searchFieldsCount}", searchFieldsCount.toString())
      .replaceAll("${search}", "search")
      .replaceAll("${allowedFields}", allowedFields)
      .replaceAll("${textFields}", `[${textFields}]`); // 修复：移除多余的方括号
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

    // // 生成创建数据接口（排除id和时间戳字段）
    // const createFields = fields.filter(
    //   (f) => !["id", "created_at", "updated_at"].includes(f.COLUMN_NAME)
    // );

    const createInterface = this.generateInterfaceRecordCode(
      module + "Create",
      fields
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
    const createValidation = fields
      .map((field) => {
        return this.generateFieldValidation(field, false);
      })
      .join(",\n");

    // 生成更新验证schema
    const updateValidation = fields
      .map((field) => {
        const isUpdate = field.COLUMN_NAME !== "id";
        return this.generateFieldValidation(field, isUpdate);
      })
      .join(",\n");

    // 生成删除验证schema
    const deleteValidation = '  id: z.number().int().min(1, "ID必须大于0")';

    // 生成列表查询验证schema
    const listValidation = `current: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).max(100).optional().default(10),
        
        // 搜索参数
        search: z.string().optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        
        // 动态字段参数
        ${fields.filter(field => 
          ['varchar', 'text', 'int', 'bigint', 'tinyint', 'datetime', 'date'].includes(field.DATA_TYPE) &&
          !['id', 'create_time', 'update_time', 'delete_time'].includes(field.COLUMN_NAME)
        ).map(field => {
          const fieldType = ['int', 'bigint', 'tinyint'].includes(field.DATA_TYPE) ? 'number().int()' : 'string()';
          return `${field.COLUMN_NAME}: z.${fieldType}.optional()`;
        }).join(',\n    ')}`;

    const templatePath = `${Deno.cwd()}/src/templates/crud/back/validator.tpl`;
    const template = await this.readTemplate(templatePath);

    return template
      .replaceAll("${capitalizedModule}", capitalizedModule)
      .replaceAll("${createValidation}", createValidation)
      .replaceAll("${updateValidation}", updateValidation)
      .replaceAll("${deleteValidation}", deleteValidation)
      .replaceAll("${listValidation}", listValidation);
  }

  // 生成字段验证规则
  private static generateFieldValidation(
    field: FieldInfo,
    isUpdate: boolean
  ): string {
    const {
      COLUMN_NAME,
      DATA_TYPE,
      IS_NULLABLE,
      CHARACTER_MAXIMUM_LENGTH,
      COLUMN_COMMENT,
    } = field;
    const fieldName = COLUMN_NAME;
    const isOptional = IS_NULLABLE === "YES" || isUpdate;
    const comment = COLUMN_COMMENT || fieldName;
  
    let validation = "";
  
    // 特殊处理时间字段
    const timeFields = ['created_at', 'updated_at', 'delete_time', 'create_time', 'update_time', 'start_time', 'end_time'];
    if (timeFields.includes(fieldName)) {
      validation = 'z.string().regex(/^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)")';
      if (isOptional) {
        validation += ".optional()";
      }
      return `  ${fieldName}: ${validation}`;
    }
  
    // 根据数据类型生成基础验证
    switch (DATA_TYPE) {
      case "varchar":
      case "text":
      case "longtext":
      case "char":
        validation = "z.string()";
        if (!isOptional) {
          validation += `.min(1, "${comment}不能为空")`;
        }
        if (CHARACTER_MAXIMUM_LENGTH) {
          validation += `.max(${CHARACTER_MAXIMUM_LENGTH}, "${comment}长度不能超过${CHARACTER_MAXIMUM_LENGTH}个字符")`;
        }
        break;
  
      case "int":
      case "bigint":
      case "tinyint":
        if (DATA_TYPE === "tinyint" && COLUMN_COMMENT?.includes(":")) {
          // tinyint 类型且有选项说明，生成枚举验证
          const options = this.extractOptionsFromComment(COLUMN_COMMENT);
          if (options.length > 0) {
            const enumValues = options.map((opt) => opt[0]).join(", ");
            validation = `z.coerce.number().int().refine(val => [${enumValues}].includes(val), { message: "请选择有效的${comment}" })`;
          } else {
            validation = "z.coerce.number().int()";
          }
        } else {
          validation = "z.coerce.number().int()";
          if (!isOptional) {
            validation += `.min(1, "${comment}必须大于0")`;
          }
        }
        break;
  
      case "decimal":
      case "float":
      case "double":
        validation = "z.number()";
        if (!isOptional) {
          validation += `.min(0, "${comment}不能为负数")`;
        }
        break;
  
      case "datetime":
      case "timestamp":
        validation = "z.string().datetime()";
        break;
  
      case "date":
        validation =
          'z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, "请输入有效的日期格式(YYYY-MM-DD)")';
        break;
  
      case "boolean":
      case "bit":
        validation = "z.boolean()";
        break;
  
      default:
        validation = "z.string()";
        if (!isOptional) {
          validation += `.min(1, "${comment}不能为空")`;
        }
    }
  
    // 添加可选标记
    if (isOptional) {
      validation += ".optional()";
    }
  
    return `  ${fieldName}: ${validation}`;
  }

  // 从注释中提取选项
  private static extractOptionsFromComment(comment: string): string[][] {
    if (!comment || !comment.includes(":")) {
      return [];
    }

    const optionsPart = comment.split(/[：:]/)[1];
    if (!optionsPart) {
      return [];
    }

    return this.convertArray([optionsPart]);
  }

  // 生成Router文件
  static async generateFrontRouter(
    userData: CreateCrudData,
    fields: Array<FieldInfo>
  ): Promise<string> {
    const { module, name } = userData;
    const moduleUpperCase = module.toUpperCase().replace(/-/g, '_');
    const order = 20; // 默认排序，可以根据需要调整
  
    const templatePath = `${Deno.cwd()}/src/templates/crud/front/router.tpl`;
    const template = await this.readTemplate(templatePath);
  
    // 替换模板中的变量
    return template
      .replaceAll("${moduleUpperCase}", moduleUpperCase)
      .replaceAll("${module}", module)
      .replaceAll("${moduleName}", name)
      .replaceAll("${order}", order.toString());
  }

  // 生成后端Router文件
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
