import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  constructor(private readonly trans: I18nService) {
  }
  getHello() {
    return this.trans.t("messages.NOT_FOUND", { args: { object: "Page" } })
  }
}
