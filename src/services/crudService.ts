import { query } from "../database/connection.ts";
import { CreateCrudData } from "../types/crud.ts";
import { TemplateEngine } from "./templateEngine.ts";
import type { FieldInfo } from "./templateEngine.ts";

export class CrudService {
  static async createCrud(userData: CreateCrudData): Promise<any> {
    // 获取表名
    const tableName = userData.table;
    if (!tableName) {
      throw new Error("表名不能为空");
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
            `src/gen/${userData.module}/locale/zh-CN.ts`,
          ],
        },
        fieldsCount: fields.length,
      },
    };
  }

  // 创建完整的模块文件夹结构
  private static async createModuleStructure(
    userData: CreateCrudData,
    fields: any[]
  ): Promise<void> {
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
    const indexVue = await TemplateEngine.generateIndexVue(
      userData,
      this.filterFields(fields),
      name
    );
    const dialogVue = await TemplateEngine.generateDialogVue(
      this.filterFields(fields)
    );
    const boCNLocale = await TemplateEngine.generateLocale(
      this.filterFields(fields),
      "bo-CN"
    );
    const enUSLocale = await TemplateEngine.generateLocale(
      this.filterFields(fields),
      "en-US"
    );
    const zhCNLocale = await TemplateEngine.generateLocale(
      this.filterFields(fields),
      "zh-CN"
    );

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
    const controllerContent = await TemplateEngine.generateController(
      userData,
      this.filterFields(fields)
    );
    const serviceContent = await TemplateEngine.generateService(
      userData,
      this.filterFields(fields)
    );
    const typesContent = await TemplateEngine.generateTypes(
      userData,
      this.filterFields(fields)
    );
    const validatorContent = await TemplateEngine.generateValidator(
      userData,
      this.filterFields(fields)
    );
    const routerContent = await TemplateEngine.generateRouter(
      userData,
      this.filterFields(fields)
    );

    // 写入API文件
    await Deno.writeTextFile(
      `${controllersDir}/${module}Controller.ts`,
      controllerContent
    );
    await Deno.writeTextFile(
      `${servicesDir}/${module}Service.ts`,
      serviceContent
    );
    await Deno.writeTextFile(`${typesDir}/${module}.ts`, typesContent);
    await Deno.writeTextFile(
      `${validatorsDir}/${module}Validator.ts`,
      validatorContent
    );
    await Deno.writeTextFile(`${routesDir}/${module}.ts`, routerContent);
    await Deno.writeTextFile(`${baseDir}/index.vue`, indexVue);
    await Deno.writeTextFile(`${componentsDir}/Dialog.vue`, dialogVue);
    await Deno.writeTextFile(`${localeDir}/bo-CN.ts`, boCNLocale);
    await Deno.writeTextFile(`${localeDir}/en-US.ts`, enUSLocale);
    await Deno.writeTextFile(`${localeDir}/zh-CN.ts`, zhCNLocale);

    await this.fileApiCopy(module);
    await this.updateRoutes(module);
  }
  private static async fileCopy(sourcePath: string, targetPath: string) {
    try {
      // 确保目标目录存在
      await Deno.mkdir(targetPath, { recursive: true });
      // 直接复制文件
      await Deno.copyFile(sourcePath, `${targetPath}/${sourcePath.split('/').pop()}`);
    } catch (error) {
      console.error(`复制文件失败: ${sourcePath} -> ${targetPath}`, error);
      throw error;
    }
  }

  private static async fileApiCopy(module: string) {
    const sourcePath = `${Deno.cwd()}/src/gen/api/${module}`;
    const targetPath = `${Deno.cwd()}/src`;
    
    try {
      // 复制控制器文件
      await this.fileCopy(
        `${sourcePath}/controllers/${module}Controller.ts`,
        `${targetPath}/controllers`
      );
      
      // 复制服务文件
      await this.fileCopy(
        `${sourcePath}/services/${module}Service.ts`,
        `${targetPath}/services`
      );
      
      // 复制类型文件
      await this.fileCopy(
        `${sourcePath}/types/${module}.ts`,
        `${targetPath}/types`
      );
      
      // 复制验证器文件
      await this.fileCopy(
        `${sourcePath}/validators/${module}Validator.ts`,
        `${targetPath}/validators`
      );
      
      // 复制路由文件
      await this.fileCopy(
        `${sourcePath}/routes/${module}.ts`,
        `${targetPath}/routes`
      );
      
      console.log(`模块 ${module} 的API文件复制完成`);
    } catch (error) {
      console.error(`复制API文件失败:`, error);
      throw error;
    }
  }

  private static async updateRoutes(module: string) {
    const routesFilePath = `${Deno.cwd()}/src/routes/index.ts`;
    
    try {
      const routesContent = await Deno.readTextFile(routesFilePath);
      
      // 检查是否已经导入了该模块
      const importStatement = `import ${module}Routes from './${module}.ts';`;
      
      if (routesContent.includes(importStatement)) {
        console.log(`模块 ${module} 的路由已经存在，跳过更新`);
        return;
      }
      
      // 找到最后一个import语句的位置
      const lines = routesContent.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') && lines[i].includes('from ')) {
          lastImportIndex = i;
        }
      }
      
      // 在最后一个import后添加新的import
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
      } else {
        // 如果没有找到import语句，在文件开头添加
        lines.splice(1, 0, importStatement);
      }
      
      // 找到export default router之前的位置添加路由注册
      let exportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('export default router')) {
          exportIndex = i;
          break;
        }
      }
      
      if (exportIndex !== -1) {
        // 在export语句前添加路由注册
        lines.splice(exportIndex, 0, '');
        lines.splice(exportIndex, 0, `router.use(${module}Routes.allowedMethods());`);
        lines.splice(exportIndex, 0, `router.use(${module}Routes.routes());`);
      }
      
      // 写回文件
      const updatedContent = lines.join('\n');
      await Deno.writeTextFile(routesFilePath, updatedContent);
      
      console.log(`模块 ${module} 的路由已成功添加到 index.ts`);
    } catch (error) {
      console.error(`更新路由文件失败:`, error);
      throw error;
    }
  }

  // 过滤字段
  private static filterFields(fields: Array<FieldInfo>) {
    return fields.filter(
      (item) =>
        !["sort"].includes(item.COLUMN_NAME)
    );
  }
}
