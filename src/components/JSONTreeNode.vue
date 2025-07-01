<script
  setup
  lang="ts"
>
import { JSONTreeNodeState, type JSONTreeNode } from '@/types/JSONTreeTypes';
import { ref, nextTick, computed } from 'vue';
import JSONTreeNodeInput from './JSONTreeNodeInput.vue';
import { useJSONTreeViewStore } from '@/store/jsonTreeViewStore';

const props = defineProps<{
  node: JSONTreeNode;
}>()

const isShowValue = computed(() => {
  // console.log('t', props.node.field, props.node.value)
  return !(typeof props.node.value === 'object' || Array.isArray(props.node.value))
});

const isNodeVariant = computed(() => {
  return props.node.state === JSONTreeNodeState.suggested && props.node.valueVariant
})

const nodeVariant = computed(() => {
  // return props.node?.nodeVariant?.map( v => ({ 'field':v.field, 'value':v.value }))
  return props.node?.nodeVariant?.map(v => v.field)
});

const store = useJSONTreeViewStore();

const handleDragOver = (event) => {
  isHover.value = true;
  event.preventDefault();
};

const handleDragLeave = (event) => {
  isHover.value = false;
  event.preventDefault();
};

const handleDragStart = (event) => {
  event.dataTransfer.setData('node', props.node.pointer);
}

const handleDrop = (event) => {
  event.preventDefault();
  const nodeNextTo = props.node.pointer;
  const nodeFrom = event.dataTransfer.getData('node');
  store.moveNode(nodeFrom, nodeNextTo);
}

const isHover = ref(false);

const changeValue = (value) => {
  console.log(value);

  store.setNode(props.node.pointer, value);
}

const changeName = (value) => {
  console.log(value);

  store.renameNode(props.node.pointer, value);
}
</script>
<!-- class="d-flex justify-start ga-1 draggable" -->

<template>
  <div
    ref="el"
    :class="['d-flex', 'justify-start', 'ga-1', 'draggable', { 'draggable-hover': isHover }]"
    draggable="true"
    @dragstart="handleDragStart($event)"
    @dragover="handleDragOver($event)"
    @dragleave="handleDragLeave($event)"
    @drop="handleDrop($event)"
  >
    <v-btn
      v-if="props.node.state === JSONTreeNodeState.suggested && !props.node.nodeVariant?.length"
      size="x-small"
      variant="plain"
      dense
      icon="mdi-plus"
      @click="store.setNode(props.node.pointer, props.node)"
    />
    <div v-if="nodeVariant?.length">
      <JSONTreeNodeVariantMenu :items="nodeVariant" />
    </div>
    <!-- <v-icon
        icon="mdi-alert-outline"
        color="red"
      /> -->
    <!-- <div>
      <v-menu
        v-if=""
        location="end"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            size="x-small"
            variant="plain"
            dense
            icon="mdi-plus"
            @click="addItem(item.pointer, item.newValue)"
          />
        </template>

<v-list>
  <v-list-item
    v-for="(item, index) in items"
    :key="index"
    :value="index"
  >
    <v-list-item-title>{{ item.field }}</v-list-item-title>
  </v-list-item>
</v-list>
</v-menu>
</div> -->
    <div class="flex-grow-0 flex-shrink-0">
      <JSONTreeNodeInput
        :value="props.node.field"
        @change="changeName"
      />
    </div>
    <div v-if="isShowValue">
      :
    </div>
    <div v-if="isShowValue && props.node.valueVariant">
      <JSONTreeNodeVariantMenu :items="props.node.valueVariant" />
    </div>
    <div class="flex-grow-1 flex-shrink-0">
      <JSONTreeNodeInput
        v-if="isShowValue"
        :value="props.node.value?.toString() ?? ''"
        @change="changeValue"
      />
    </div>
  </div>
</template>


<style
  lang="css"
  scoped
>
.draggable-hover {
  text-decoration: underline;
}
</style>