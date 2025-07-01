<script
  setup
  lang="ts"
>
import { nextTick, ref } from 'vue';

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  italic: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const textInput = ref(null);
const value = ref(props.value);

const isEdit = ref(false);
const enableEditMode = () => {
  // переход в режим правки только если разрешено сверху
  if (props.readonly) return;

  isEdit.value = true;
  nextTick(() => {
    textInput.value?.focus();
  });
};

const disableEditMode = () => {
  isEdit.value = false;

   // если пусто, оставляем старое значение. если нет, сохраняем
  if (value.value.trim() !== "") {
    console.log(value.value.trim());

    emit("change", value.value);
  }
};

const emit = defineEmits(['change'])

// const resizeInput = () => {
//   textInput.value?.width = ; 
//   console.log(textInput.value?.width);
  
// }

</script>
<template>
  <v-text-field
    ref="textInput"
    v-model="value"
    :readonly="!isEdit"
    :variant="!isEdit ? 'plain' : 'underlined'"
    single-line
    class="custom-padding"
    density="compact"
    hide-details
    center-affix
    :width="(value.length + 1) + 'ch'"
    @click.stop
    @dblclick="enableEditMode"
    @blur="disableEditMode"
  >
    <template #append-inner>
      <!-- <v-combobox
            label="Combobox"
            :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
          ></v-combobox> -->

      <!-- <v-btn
          v-if="!readonly"
          icon="mdi-close"
          density="comfortable"
          size="x-small"
          @click="clearInput"
        /> -->
    </template>
  </v-text-field>
</template>

<style scoped>
.custom-padding :deep(.v-field__input),
.custom-padding :deep(.v-field__append-inner) {
  padding-top: 0 !important;
}
</style>