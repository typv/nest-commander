import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import moment from 'moment';
import { EntityTarget, DataSource } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

export function DateAfter(targetDate: string = null, granularity: moment.unitOfTime.StartOf, setEqual = false, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'DateAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [targetDate],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          let relatedValue;
          if (targetDate) {
            const [relatedPropertyName] = args.constraints;
            relatedValue = (args.object as any)[relatedPropertyName];
          } else {
            // The value must be greater than today
            relatedValue = moment();
          }
          if (setEqual) {
            return moment(value).isSameOrAfter(relatedValue, granularity);
          }
          return moment(value).isAfter(relatedValue, granularity);
        },
        defaultMessage() {
          if (targetDate) {
            if (setEqual) {
              return `The value of field '$property' must be greater than or equal the value of field '${targetDate}'`;
            }
            return `The value of field '$property' must be greater than the value of field '${targetDate}'`;
          } else {
            if (setEqual) {
              return `The value of field '$property' must be greater than or equal this ${granularity}`;
            }
            return `The value of field '$property' must be greater than this ${granularity}.`;
          }
        }
      },
    });
  };
}

export function IsTextAndNumber(allowNumber: boolean, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsTextAndNumber',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          let format;
          if (allowNumber) {
            // Accept text and number
            format = /^[^*|\":<>[\]{}`\\()';@&$]+$/;
          } else {
            // Accept text only
            format = /^[^*|\":<>[\]{}`\\()';@&$0-9]+$/;
          }

          return format.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          if (allowNumber) {
            return `The value of field '$property' must be text and number.`;
          }

          return `The value of field '$property' must be text only.`;
        }
      },
    });
  };
}

export function IsDateFormat(format: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {

        return moment(value, format).format(format) == value;
        },
        defaultMessage(args: ValidationArguments) {
          return `The value of field '$property' must be valid date format ${format}`;
        }
      },
    });
  };
}

export function Exist(entity: EntityTarget<ObjectLiteral>, validationOptions?: ValidationOptions, dataSource?: DataSource) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'Exist',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const exist = await dataSource.getRepository(entity).createQueryBuilder()
            .where(`id = :value`, {value: value})
            .getOne();

          return !!exist;
        },
        defaultMessage(args: ValidationArguments) {
          return `$property not exist.`;
        }
      },
    });
  };
}

export function Unique(entity: EntityTarget<ObjectLiteral>, validationOptions?: ValidationOptions, dataSource?: DataSource) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'Unique',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const exist = await dataSource.getRepository(entity).createQueryBuilder()
            .where(`${args.property} = :value`, {value: value.trim()})
            .getOne();

          return !exist;
        },
        defaultMessage(args: ValidationArguments) {
          return `$property must be unique.`;
        }
      },
    });
  };
}

export function GreaterThanOrEqualTo(targetField: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'GreaterThanOrEqualTo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [targetField],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `The value of field '$property' must be greater than or equal to '${targetField}'`;
        }
      },
    });
  };
}

export function StringMaxWords(max: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'StringMaxWords',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          if (!value) {
            return true;
          }
          value += '';
          let count = value.split(' ').length;

          return count <= max;
        },
        defaultMessage(args: ValidationArguments) {
          return `$property must have less than or equal ${max} words.`;
        }
      },
    });
  };
}