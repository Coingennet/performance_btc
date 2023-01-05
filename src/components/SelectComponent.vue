<template>
  <div
    class="custom-select"
    :tabindex="tabindex"
    @blur="open = false"
    :style="{ width: widthSelect }"
  >
    <div class="selected" :class="{ open: open }" @click="open = !open">
      {{ selected }}
    </div>
    <div class="items" :class="{ selectHide: !open }">
      <div
        v-for="(option, i) of options"
        :key="i"
        @click="
          selected = option;
          open = false;
          $emit('input', option);
        "
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number, Object, Array],
      default: null,
    },
    options: {
      type: Array,
      required: true,
    },
    default: {
      type: String,
      required: false,
      default: null,
    },
    tabindex: {
      type: Number,
      required: false,
      default: 0,
    },
    itemValue: {
      type: [String],
      default: "name",
    },
    itemText: {
      type: [String],
      default: "name",
    },
    width: {
      type: [String, Number],
      default: "100px",
    },
  },
  computed: {
    selected: {
      get() {
        if (typeof this.value === "object" && this.value !== null) {
          return this.options.find((x) => x[this.itemValue] == this.value);
        }
        return this.value;
      },
      set(value) {
        let result = value;
        if (typeof result === "object" && result !== null) {
          result = result[this.itemValue];
        }
        this.$emit("input", result);
      },
    },
    widthSelect() {
      return isNaN(this.width) ? this.width : `${this.width}px`;
    },
  },
  data() {
    return {
      open: false,
    };
  },
  mounted() {
    this.$emit("input", this.selected);
  },
};
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  text-align: left;
  outline: none;
  height: 47px;
  line-height: 47px;
}

.custom-select .selected {
  background-color: #0a0a0a;
  border-radius: 6px;
  border: 1px solid #666666;
  color: #a1a7bb;
  padding-left: 1em;
  cursor: pointer;
  user-select: none;
}

.custom-select .selected.open {
  border: 1px solid #171924;
  border-radius: 6px 6px 0px 0px;
}

.custom-select .selected:after {
  position: absolute;
  content: "";
  top: 22px;
  right: 1em;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-color: #a1a7bb transparent transparent transparent;
}

.custom-select .items {
  color: #a1a7bb;
  border-radius: 0px 0px 6px 6px;
  overflow: hidden;
  border-right: 1px solid #171924;
  border-left: 1px solid #171924;
  border-bottom: 1px solid #171924;
  position: absolute;
  background-color: #0a0a0a;
  left: 0;
  right: 0;
  z-index: 1;
}

.custom-select .items div {
  color: #a1a7bb;
  padding-left: 1em;
  cursor: pointer;
  user-select: none;
}

.custom-select .items div:hover {
  background-color: #171924;
}

.selectHide {
  display: none;
}
</style>
