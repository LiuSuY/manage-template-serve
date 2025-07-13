import { CreateCrudData } from "../types/crud.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

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
    fields: any[]
  ): Promise<string> {
    const templatePath = `${Deno.cwd()}/src/templates/crud/index.vue`;
    const template = await this.readTemplate(templatePath);
    let result = template;
    return result;
  }

  // 生成接口代码
  private static generateInterfaceCode() {}

  // 生成对话框Vue文件
  static async generateDialogVue(
    userData: CreateCrudData,
    fields: any[]
  ): Promise<string> {
    const templatePath = `${Deno.cwd()}/src/templates/crud/components/dialog.vue`;
    const template = await this.readTemplate(templatePath);

    // 将现有模板中的硬编码内容替换为动态内容
    let result = template;
    return result;
  }

  // 生成对话框表单代码
  private static generateDialogFormCode(fields: any[]): string {}

  // 生成语言
  private static async generateLocale(
    userData: CreateCrudData,
    fields: any[],
    lang: string
  ): Promise<string> {
    const templatePath = `${Deno.cwd()}/src/templates/crud/locale/${lang}.ts`;
    const template = await this.readTemplate(templatePath);

    // 将现有模板中的硬编码内容替换为动态内容
    let result = template;
    return result;
  }
}
