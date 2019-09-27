/**
 * Класс для работы с географической точкой
 * Latitude - Широта от -90° до 90°
 *  - Северная широта положительная (27°51′00″N === 27.8500000)
 *  - Южная широта отрицательная (40°00′56″S  === -40.0156799)
 *
 * Longitude - Долгота от -180° до 180°
 *  - Восточная долгота положительная (131°57′50″E === 131.9638888)
 *  - Западная долгота отрицательная (070°22′25″W === -70.3759577)
 *
 * @class core.data.geography.Coordinate
 */
class Coordinate {
  /**
   * Хранит значение типов координат
   * @property {{LONGITUDE: String, LATITUDE: String}} TYPE
   * @static
   */
  static TYPE = {
    LATITUDE: 'Latitude',
    LONGITUDE: 'Longitude'
  };

  /**
   * Хранит значения направлений света
   * @property {{NORTH: String, WEST: String, SOUTH: String, EAST: String}} DIRECTION
   * @static
   */
  static DIRECTION = {
    NORTH: 'N',
    SOUTH: 'S',
    WEST: 'W',
    EAST: 'E'
  };

  /**
   * Значение формата вывода в строку по-умолчанию
   * @property {String} [defaultFormat = '{0}°{1}′{2}″ {3}']
   */
  defaultFormat = '{0}°{1}′{2}″ {3}';

  /**
   * Хранит значение координаты в числовом формате с плавающей точкой
   * _v = value значене
   * @property {Number} [_v = null]
   * @private
   */
  _v = null;

  /**
   * Хранит в себе значение градусов координаты
   * _deg = degree градусы
   * @property {Number} [_deg = null]
   * @private
   */
  _deg = null;

  /**
   * Хранит в себе значение минут координаты
   * _min = minute минуты
   * @property {Number} [_min = null]
   * @private
   */
  _min = null;

  /**
   * Хранит в себе значение секунд координаты
   * _sec = second секунды
   * @property {Number} [_sec = null]
   * @private
   */
  _sec = null;

  /**
   * Хранит в себе значение положение координат в зависивости от типа
   * _dir = direction направление/значение
   *
   * _t === "Latitude":
   *  - Северные (N или С.Ш.)
   *  - Южные (S или Ю.Ш.)
   *
   * _t === "Longitude":
   *  - Восточные (E или В.Д.)
   *  - Западные (W или З.Д.)
   *
   * @property {String} [_dir = '']
   * @private
   */
  _dir = '';

  /**
   * Хранит в себе значение типа координат Coordinate.TYPE
   * _t = type тип
   * @property {String} _t
   * @private
   */
  _t;

  /**
   * Хранит регулярные выражения для проверки входящих строк
   * @type {{lng: RegExp, lat: RegExp}}
   * @private
   */
  _regex = {
    lat: /^(?<deg>\d{1,2})[^\dСNЮS]*(?<min>\d{0,2})?[^\dСNЮS]*(?<sec>\d{0,2})?[^\dСNЮS]*(?<dir>(С|N)|(Ю|S))?$/,
    lng: /^(?<deg>\d{1,3})[^\dВEЗW]*(?<min>\d{0,2})?[^\dВEЗW]*(?<sec>\d{0,2})?[^\dВEЗW]*(?<dir>(В|E)|(З|W))?$/,
  };

  /**
   * Значение координаты
   * @property {Number} value
   * @accessor
   */
  get value() {
    return this._v;
  }

  /**
   * Значение координаты
   * @property {Object|Number|String} value
   * @accessor
   */
  set value(value) {
    let tmp;

    // Устанавливаем значение по умолчанию, если его нету
    this._dir = this._dir ?
        this._dir :
        this._t === Coordinate.TYPE.LATITUDE ? Coordinate.DIRECTION.NORTH : Coordinate.DIRECTION.EAST;

    // Если получили что-то не понятное, устанавливает пустое значение
    if (value === null || value === undefined || value === '') {
      this.clear();
      return;
    }
    // Если все же получили что-то иное, определяем тип и преобразуем
    switch (typeof value) {
      case 'string':
        if (this._t === Coordinate.TYPE.LATITUDE) {
          if (this._regex.lat.test(value)) {
            tmp = this._regex.lat.exec(value).groups;
            for (let key in tmp)
              tmp[key] = tmp[key] ? parseInt(tmp[key]) : 0;
            this.value = tmp;
            break;
          }
          throw new Error(`Not allowed type of coordinate. Value is  (${typeof value}) "${value}"`);
        }
        else if (this._t === Coordinate.TYPE.LONGITUDE) {
          if (this._regex.lng.test(value)) {
            tmp = this._regex.lng.exec(value).groups;
            for (let key in tmp)
              tmp[key] = tmp[key] ? parseInt(tmp[key]) : 0;
            this.value = tmp;
            break;
          }
          throw new Error(`Not allowed type of coordinate. Value is  (${typeof value}) "${value}"`);
        }
        break;
      case 'object':
        if (this._t === Coordinate.TYPE.LATITUDE) {
          // Если ввели данные вне "рамок", то устанавливаем максимально допустимое значение
          if (value.sec >= 60) {
            value.min++;
            this._sec = value.sec % 60 || 0;
          }
          else {
            this._sec = value.sec;
          }

          if (value.min >= 60) {
            value.deg++;
            this._min = value.min % 60 || 0;
          }
          else {
            this._min = value.min;
          }

          if (value.deg >= 90) {
            this._deg = 90;
            this._min = 0;
            this._sec = 0;
          }
          else {
            this._deg = value.deg;
          }

          this._dir = value.dir || this._dir;
          this._object2number();
        }
        else if (this._t === Coordinate.TYPE.LONGITUDE) {
          if (value.sec >= 60) {
            value.min++;
            this._sec = value.sec % 60 || 0;
          }
          else {
            this._sec = value.sec;
          }

          if (value.min >= 60) {
            value.deg++;
            this._min = value.min % 60 || 0;
          }
          else {
            this._min = value.min;
          }

          if (value.deg >= 180) {
            this._deg = 180;
            this._min = 0;
            this._sec = 0;
          }
          else {
            this._deg = value.deg;
          }
          this._dir = value.dir || this._dir;
          this._object2number();
        }
        break;
      case 'number':
        this._v = value;
        this._number2object();
        break;
      default:
        throw new Error(`Not allowed type of coordinate. Value is  (${typeof value}) "${value}"`);
    }
  }

  /**
   * Конструктор являеться расширенной версией сеттера value (this.value = ...)
   *  - Строка: "[0-90] [0-59] [0-59] ['N'|'S']" или "[0-180] [0-59] [0-59] ['E'|'W']"
   *  - Объект: {dir: ["N"|"S"|"W"|"E"], deg: [0-90|0-180], min: [0-59], sec: [0-59]}
   *  - Число: [-180.0, 180.0]
   *
   * @param value
   * @param type
   */
  constructor(value, type) {
    this._t = type;
    this.value = value;
  }

  /**
   * Устанавливает нулевые значения
   */
  clear() {
    this._v = null;
    this._deg = null;
    this._min = null;
    this._sec = null;
  }

  /**
   * Проверяет, являеться ли объект "пустым"
   * @returns {boolean}
   */
  isEmpty() {
    return (
        this._v === null &&
        this._deg === null &&
        this._min === null &&
        this._sec === null
    );
  }

  /**
   * Преобразует координату в тот тип, что передают в параметр type (string|object|number)
   * @param {String} [type = 'string']
   * @param {String} [template=#defaultFormat] Look #defaultFormat.
   * @returns {String|Object|Number}
   */
  format(type = 'string', template = null) {
    if (!template) template = this.defaultFormat;
    let result, tmp = {};

    if (this.isEmpty()) {
      switch (type) {
        case 'string':
          result = '';
          break;
        case 'object':
          result = {
            dir: this._dir,
            deg: null,
            min: null,
            sec: null
          };
          break;
        case 'number':
          result = null;
          break;
      }
    }
    else {
      switch (type) {
        case 'string':
          tmp.deg = String(this._deg).leftPad(this._t === Coordinate.TYPE.LATITUDE ? 2 : 3, '0');
          tmp.min = String(this._min).leftPad(2, '0');
          tmp.sec = String(this._sec).leftPad(2, '0');
          tmp.dir = this._dir;
          
          result = template.format(tmp.deg, tmp.min, tmp.sec, tmp.dir);
          break;
        case 'object':
          result = {
            dir: this._dir,
            deg: this._deg,
            min: this._min,
            sec: this._sec
          };
          break;
        case 'number':
          result = +(this._v.toFixed(7));
          break;
      }
    }
    return result;
  }

  /**
   * Высчитывает данные из double:
   *  - Градусы _deg (Number)
   *  - Минуты _min (Number)
   *  - Секунды _sec (Number)
   *  - Направление _dir (Boolean)
   *
   * @param [round = false]
   * @private
   */
  _number2object(round = false) {
    // Вычисляем значение градусов, минут и секунд
    this._deg = Math.trunc(this._v);
    this._min = Math.trunc((this._v - this._deg) * 60);
    this._sec = Math.round(((this._v - this._deg) * 60 - this._min) * 60);
    // Если есть флаг, округляем значение секунд кратное 10-и
    if (round) {
      this._sec = Math.round(parseFloat(this._sec / 10) * 10);
    }
    // Устанавливаем направление
    if (this._t === Coordinate.TYPE.LATITUDE) {
      this._dir = (this._deg >= 0) ? Coordinate.DIRECTION.NORTH : Coordinate.DIRECTION.SOUTH;
    }
    else if (this._t === Coordinate.TYPE.LONGITUDE) {
      this._dir = (this._deg >= 0) ? Coordinate.DIRECTION.EAST : Coordinate.DIRECTION.WEST;
    }
    // Устанавливаем значение по модулю, значение могло быть отрицательным
    this._deg = Math.abs(this._deg);
    this._min = Math.abs(this._min);
    this._sec = Math.abs(this._sec);
    // Округляем секунды, если их 60
    if (this._sec === 60) {
      this._sec = 0;
      this._min++;
    }
    // Округляем минуты, если их 60
    if (this._min === 60) {
      this._min = 0;
      this._deg++;
    }
  }

  /**
   * Высчитывает данные из object:
   *  - Значение (Number)
   * @private
   */
  _object2number() {
    this._v = this._sec / 3600 + this._min / 60 + this._deg;
    if (this._t === Coordinate.TYPE.LATITUDE) {
      this._v *= this._dir === Coordinate.DIRECTION.SOUTH ? -1 : 1;
    }
    else if (this._t === Coordinate.TYPE.LONGITUDE) {
      this._v *= this._dir === Coordinate.DIRECTION.WEST ? -1 : 1;
    }
  }
}


if (typeof window !== 'undefined' && define) {
  define('core.data.geography.Coordinate', Coordinate);
}
export default Coordinate;
