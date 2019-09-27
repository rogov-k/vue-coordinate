<style lang="scss" scoped>
  /* Default case: */
  .nic-coordinate {
    display: flex;
    width: 100%;

    input {
      width: calc(100% - 50px);
      border-right: none;
    }

    .NicForm__Error {
      background-color: #FFFFFF;
      border-top: 1px solid $field-border-focus;
      border-bottom: 1px solid $field-border-focus;
    }

    select {
      display: block;
      width: 50px;
      height: 30px;
      background-color: $pale-grey-two;
      padding-left: 5px;
      margin-left: 0;
    }

    /* Default case when is focus: */
    &.focused {
      box-shadow: 0 0 0 1px $field-border-focus-shadow;

      input {
        border-color: $field-border-focus;
        box-shadow: none;
        border-right: none;
      }

      select {
        border-color: $field-border-focus;
        box-shadow: none;
      }
    }
  }

  /* Error case: */
  .nic-coordinate.error:not(.focused) {
    box-shadow: 0 0 0 1px $field-error-shadow;

    .NicForm__Error {
      border-top: 1px solid $field-error-border;
      border-bottom: 1px solid $field-error-border;
    }

    input, select {
      border-color: $field-error-border;
    }
  }
</style>

<template>
  <div v-if="type.toUpperCase() === 'LATITUDE'" :class="{
  'nic-coordinate': true,
  'focused': isFocus,
  'error': validation && !validation.isValid && validation.touched
  }">
    <input maxlength="9"
           v-mask="'##°##′##″'"
           :value="v"
           :placeholder="placeholder || 'ГГ°ММ′СС″'"
           @input="onInput"
           @focus="onFocus"
           @blur="onBlur"/>
    <nic-error-label v-if="validation && !validation.isValid" :validation="validation"/>
    <select v-model="direction"
            @focus="onFocus"
            @blur="onBlur"
            @change="onChangeDirection">
      <option value="N">С</option>
      <option value="S">Ю</option>
    </select>
  </div>
  <div v-else-if="type.toUpperCase() === 'LONGITUDE'" :class="{
  'nic-coordinate': true,
  'focused': isFocus,
  'error': validation && !validation.isValid && validation.touched,
  }">
    <input maxlength="10"
           v-mask="'###°##′##″'"
           :value="v"
           :placeholder="placeholder || 'ГГГ°ММ′СС″'"
           @input="onInput"
           @focus="onFocus"
           @blur="onBlur"/>
    <nic-error-label v-if="validation && !validation.isValid" :validation="validation"/>
    <select v-model="direction"
            @focus="onFocus"
            @blur="onBlur"
            @change="onChangeDirection">
      <option value="E">В</option>
      <option value="W">З</option>
    </select>
  </div>
</template>

<script>
  import Coordinate from "./data/Coordinate";


  export default {
    name: 'nic-coordinate',
    props: {
      /**
       * Числовое значение координаты
       * @property {Number} value
       */
      value: {
        type: Number,
        default: null
      },
      /**
       * Тип координаты
       * @property {String} type
       */
      type: {
        type: String,
        default: ''
      },
      /**
       * Placeholder
       * @property {String} placeholder
       */
      placeholder: {
        type: String,
        default: ''
      },
      /**
       * Валидация поля
       * @property {Object} validation
       */
      validation: {
        type: Object,
        default: null
      },
    },

    data() {
      return {
        /**
         * Строковое значение координат для текстового поля
         * @property {String} v
         */
        v: '',
        /**
         * Строковое значение направления для селекта
         * @property {String} direction
         */
        direction: '',
        /**
         * Предаствление координат в виде объекта
         * @property {data.Coordinate} coordinate
         */
        coordinate: new Coordinate(null, Coordinate.TYPE[this.type.toUpperCase()]),
        /**
         * Флаг, поле сейчас в фокусе
         * @property {Boolean} isFocus
         */
        isFocus: false
      };
    },

    created() {
      this.v = this.format(this.value);
      this.direction = this.coordinate.format("object").dir;
    },

    watch: {
      value(v) {
        if (!this.isFocus) {
          this.v = this.format(v);
        }
        this.touchValidation();
        this.direction = this.coordinate.format("object").dir;
      }
    },

    methods: {
      /**
       * При вводе данных
       * @param {Event} e
       */
      onInput(e) {
        this.v = e.target.value;
        this.$emit('input', this.convert(e.target.value));
      },
      /**
       * При фокусе на input или select
       * @param {Event} e
       */
      onFocus(e) {
        this.isFocus = true;
        this.$emit('focus', e);
      },
      /**
       * При поетри фокуса
       * @param {Event} e
       */
      onBlur(e) {
        this.isFocus = false;
        this.$emit('blur', e);
        this.v = this.format(this.value);
      },
      /**
       * При смени направления у координаты (select)
       */
      onChangeDirection() {
        this.$emit('input', this.convert(-this.value));
      },
      /**
       * Валидируем поле
       */
      touchValidation() {
        if (this.validation) {
          this.validation.$touch();
          this.$parent.$forceUpdate();
        }
      },
      /**
       * Конвертируем даные в число
       * @param {Number} v
       */
      format(v) {
        this.coordinate.value = v;
        return this.coordinate.format('string', '{0}°{1}′{2}″');
      },
      /**
       * Преобразуем число в объект и данные для формы
       * @param {String} v
       */
      convert(v) {
        this.coordinate.value = v;
        return this.coordinate.format('number');
      }
    },

    install(Vue) {
      Vue.component('nic-coordinate', this);

      /**
       * Фильтр для преобразования числа в в строковое представление координат
       * {@see ./data/Coordinate.js} метод format()
       *
       *  @example
       *  let foo = 2.72;
       *  <p>{{ foo | coordinate('latitude') }}</p> //> <p>02°43′12″ N</p>
       *
       * @param {Number} value
       * @param {String} type
       * @param {String} [format = '{0}°{1}′{2}″ {3}']
       * @returns {String}
       */
      let formatCoordinate = function(value, type, format = '{0}°{1}′{2}″ {3}') {
        if (!value || !type) return '';
        let c = new Coordinate(value, Coordinate.TYPE[type.toUpperCase()]);

        return c.format('string', format);
      };
      Vue.filter('coordinate', formatCoordinate);
      Vue.$formatCoordinate = formatCoordinate;

    },
  };
</script>
