import { BadRequestException, HttpException } from '@nestjs/common';
import moment from "moment-timezone";
import { SelectQueryBuilder } from "typeorm";
import { constants } from '../../constants/constant';

export class BaseService {
  responseOk(data: any = null, msg: string = null): any {
    let response = {
      success: true,
      message: msg,
      data: data,
    }
    if (!data) {
      delete response.data;
      if (!msg) {
        delete response.message;
      }
    } else {
      delete response.success;
      if (!msg) {
        response = data;
      }
    }

    return response;
  }

  responseErr(code: number = 500, msg: string = 'Internal Server Error', data: any = null) {
    const res = {
      statusCode: code,
      message: msg,
    }
    if (data) {
      res['data'] = data;
    }

    throw new HttpException(res, code);
  }

  makeExpired(number, unit = 'days') {
    return moment().add(number, unit).format('YYYY-MM-DD HH:mm:ss');
  }

  makeRandomString(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
          charactersLength));
    }

    return result;
  }

  makeRandomNumber(min: number, max: number) {
    return Math.floor(min + Math.random() * max);
  }

  protected canUpdateStep(currentStep, nextStep, targetStep) {
    return currentStep == targetStep || nextStep == targetStep;
  }

  // Convert array of string to array unique of string (string to uc first)
  protected arrayUniqueStrToUcFirst(arr: string[]) {
    for (let key in arr) {
      let str = arr[key].trim();
      if (!str) {
        continue;
      }
      arr[key] = this.stringToUcFirst(str);
    }

    return arr.filter(function(item, pos){
      return arr.indexOf(item)== pos;
    });
  }

  protected stringToUcFirst(str: string) {
    if (!str) {
      return null;
    }

    return str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
      return letter.toUpperCase();
    });
  }
  

  protected getRemainTimeToEndDay(unit: moment.unitOfTime.Diff = "seconds") {
    const now = moment();
    const endDay = now.clone().endOf('day');

    return endDay.diff(now, unit);
  }

  protected convertIdsStringToArrUnique(ids: string, separator: string = ',') {
    if (!ids || ids.length == 0) {
      return [];
    }
    const arrayOfIds = ids.split(separator);

    // Get unique value
    return arrayOfIds.filter((value, index, self) => {
      return value && self.indexOf(value) === index;
    });
  }

  protected now() {
    return moment().toDate();
  }

  protected nowUTCString() {
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
  }

  protected convertTimezone(datetime: string, fromTimezone: string, toTimeZone: string) {
    datetime = moment(datetime).format('YYYY-MM-DD HH:mm:ss');
    const start = moment.tz(datetime, fromTimezone);

    return start.tz(toTimeZone);
  }
  protected convertTimezoneAndFormat(datetime: string, fromTimezone: string, toTimeZone: string, format = 'YYYY-MM-DD HH:mm:ss') {
    return this.convertTimezone(datetime, fromTimezone, toTimeZone).format(format);
  }

  async customPaginate<T>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = constants.PAGINATION.PAGE_DEFAULT,
    limit: number = constants.PAGINATION.LIMIT_DEFAULT
  ) {
    page = +page;
    limit = +limit;
    const start = (page - 1) * limit;
    const result = await queryBuilder
      .skip(start)
      .take(limit)
      .getManyAndCount();
    const items = result[0];
    const totalItems = result[1];
    const totalPage = Math.ceil(totalItems/limit);

    return {
      items: items,
      meta: {
        "totalItems": totalItems,
        "itemCount": items.length,
        "itemsPerPage": limit,
        "totalPages": totalPage,
        "currentPage": page,
      }
    }
  }

  protected insertString(str: string, start: number, delCount: number, newSubStr: string): string {
    return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
  }
}
