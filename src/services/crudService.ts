import { query } from "../database/connection.ts";
import { CreateCrudData } from "../types/crud.ts";
import { TemplateEngine } from "./templateEngine.ts";

export class CrudService {
  static async createCrud(userData: CreateCrudData): Promise<any> {
    // 获取表名
    const tableName = userData.table;
    if (!tableName) {
      throw new Error('表名不能为空');
    }

    // 查询表中所有字段详细信息
    const fields = await query(
      `SELECT *
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = ? AND TABLE_SCHEMA = DATABASE()
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
    const { module } = userData;
    const baseDir = `${Deno.cwd()}/src/gen/${module}`;
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
    const indexVue = await TemplateEngine.generateIndexVue(userData, fields);
    const dialogVue = await TemplateEngine.generateDialogVue(userData, fields);
    const boCNLocale = await TemplateEngine.generateLocale(userData, fields, 'bo-CN');
    const enUSLocale = await TemplateEngine.generateLocale(userData, fields, 'en-US');
    const zhCNLocale = await TemplateEngine.generateLocale(userData, fields, 'zh-CN');

    // 写入文件
    await Deno.writeTextFile(`${baseDir}/index.vue`, indexVue);
    await Deno.writeTextFile(`${componentsDir}/Dialog.vue`, dialogVue);
    await Deno.writeTextFile(`${localeDir}/bo-CN.ts`, boCNLocale);
    await Deno.writeTextFile(`${localeDir}/en-US.ts`, enUSLocale);
    await Deno.writeTextFile(`${localeDir}/zh-CN.ts`, zhCNLocale);
  }
}
