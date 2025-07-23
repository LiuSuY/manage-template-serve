import { query } from "../database/connection.ts";
import { CreateCrudData } from "../types/crud.ts";
import { TemplateEngine } from "./templateEngine.ts";
import type { FieldInfo } from "./templateEngine.ts";

export class CrudService {
  static async createCrud(userData: CreateCrudData): Promise<any> {
    // 获取表名
    const tableName = userData.table;
    if (!tableName) {
      throw new Error('表名不能为空');
    }

    // 查询表中所有字段详细信息
    const fields = await query(
      `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, 
              IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [tableName]
    );

    if (!fields || fields.length === 0) {
      throw new Error(`表 ${tableName} 不存在或没有字段`);
    }

    // 创建完整的文件夹结构
    await this.createModuleStructure(userData, fields);

    return {
      success: true,
      message: "模块文件夹结构生成成功",
      data: {
        tableName,
        module: userData.module,
        controller: userData.controller,
        generatedStructure: {
          mainFolder: `src/gen/${userData.module}`,
          files: [
            `src/gen/${userData.module}/index.vue`,
            `src/gen/${userData.module}/components/Dialog.vue`,
            `src/gen/${userData.module}/locale/bo-CN.ts`,
            `src/gen/${userData.module}/locale/en-US.ts`,
            `src/gen/${userData.module}/locale/zh-CN.ts`
          ]
        },
        fieldsCount: fields.length
      }
    };
  }

  // 创建完整的模块文件夹结构
  private static async createModuleStructure(userData: CreateCrudData, fields: any[]): Promise<void> {
    const { module, name } = userData;
    const baseDir = `${Deno.cwd()}/src/gen/front/${module}`;
    const componentsDir = `${baseDir}/components`;
    const localeDir = `${baseDir}/locale`;

    // 创建文件夹结构
    try {
      await Deno.mkdir(baseDir, { recursive: true });
      await Deno.mkdir(componentsDir, { recursive: true });
      await Deno.mkdir(localeDir, { recursive: true });
    } catch (error) {
      // 文件夹已存在，忽略错误
    }

    // 使用模板引擎生成各个文件
    const indexVue = await TemplateEngine.generateIndexVue(userData, this.filterFields(fields), name);
    const dialogVue = await TemplateEngine.generateDialogVue(this.filterFields(fields));
    const boCNLocale = await TemplateEngine.generateLocale(this.filterFields(fields), 'bo-CN');
    const enUSLocale = await TemplateEngine.generateLocale(this.filterFields(fields), 'en-US');
    const zhCNLocale = await TemplateEngine.generateLocale(this.filterFields(fields), 'zh-CN');


    // 生成API文件
    const apiBaseDir = `${Deno.cwd()}/src/gen/api/${module}`;
    const controllersDir = `${apiBaseDir}/controllers`;
    const servicesDir = `${apiBaseDir}/services`;
    const typesDir = `${apiBaseDir}/types`;
    const validatorsDir = `${apiBaseDir}/validators`;
    const routesDir = `${apiBaseDir}/routes`;
    
    // 创建API文件夹结构
    try {
      await Deno.mkdir(controllersDir, { recursive: true });
      await Deno.mkdir(servicesDir, { recursive: true });
      await Deno.mkdir(typesDir, { recursive: true });
      await Deno.mkdir(validatorsDir, { recursive: true });
      await Deno.mkdir(routesDir, { recursive: true });
    } catch (error) {
      // 文件夹已存在，忽略错误
    }
    
    // 生成API文件内容
    const controllerContent = await TemplateEngine.generateController(userData, this.filterFields(fields));
    const serviceContent = await TemplateEngine.generateService(userData, this.filterFields(fields));
    const typesContent = await TemplateEngine.generateTypes(userData, this.filterFields(fields));
    const validatorContent = await TemplateEngine.generateValidator(userData, this.filterFields(fields));
    const routerContent = await TemplateEngine.generateRouter(userData, this.filterFields(fields));

    // 写入API文件
    await Deno.writeTextFile(`${controllersDir}/${module}Controller.ts`, controllerContent);
    await Deno.writeTextFile(`${servicesDir}/${module}Service.ts`, serviceContent);
    await Deno.writeTextFile(`${typesDir}/${module}.ts`, typesContent);
    await Deno.writeTextFile(`${validatorsDir}/${module}Validator.ts`, validatorContent);
    await Deno.writeTextFile(`${routesDir}/${module}.ts`, routerContent);
    await Deno.writeTextFile(`${baseDir}/index.vue`, indexVue);
    await Deno.writeTextFile(`${componentsDir}/Dialog.vue`, dialogVue);
    await Deno.writeTextFile(`${localeDir}/bo-CN.ts`, boCNLocale);
    await Deno.writeTextFile(`${localeDir}/en-US.ts`, enUSLocale);
    await Deno.writeTextFile(`${localeDir}/zh-CN.ts`, zhCNLocale);
  }
  // 过滤字段
  private static filterFields(fields: Array<FieldInfo>) {
    return fields.filter(item => !['create_time', 'update_time', 'sort'].includes(item.COLUMN_NAME));
  }
}
