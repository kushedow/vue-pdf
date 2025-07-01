<script
  setup
  lang="ts"
>
import { computed } from 'vue';


const props = defineProps<{
  items: unknown[];
}>()

const items = computed(() => {
  // console.log(props.items);
  return props.items.map( value => {
    if (typeof value === 'object' && !Array.isArray(value))
    {
      // 5 row of json
      return JSON.stringify(value, null, " ").split("\n",5).join("\n");
    } 
    
    return String(value);
  });
  // return props.items
})

</script>

<template>
  <v-menu
    location="end"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        size="x-small"
        variant="plain"
        dense
        icon="mdi-chevron-down"
      />
    </template>

    <v-list>
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        :value="index"
        class="text-caption	"
      >
        <pre><code>{{ item }}</code></pre>
      </v-list-item>
    </v-list>
  </v-menu>
</template>