<script
  setup
  lang="ts"
>
import { computed, reactive } from 'vue';

import { compileSchema, type JsonSchema, type SchemaNode } from "json-schema-library";
import { JSONPath } from 'jsonpath-plus';

const myJsonSchema: JsonSchema = {
  "$defs": {
    "NodeItems": {
      "type": "array",
      "items": {
        "type": "object",
        "default": {},
        "properties": {
          "text": { "type": "string", "default": "sub-title" },
          "items": { "$ref": "#/$defs/NodeItems" }
        },
        "required": ["text"],
        "additionalProperties": false
      }
    }
  },
  "properties": {
    "root": {
      "$ref": "#/$defs/NodeItems"
    }
  }

}

const myJsonSchema2: JsonSchema = {
  "$defs": {
    "NodeItems": {
      "type": "array",
      "items": {
        "type": "object",
        "default": {},
        "properties": {
          "text": { "type": "string", "default": "sub-title" },
          "items": { "$ref": "#/$defs/NodeItems" }
        },
        "required": ["text"],
        "additionalProperties": false
      }
    }
  },
  "$ref": "#/$defs/NodeItems"
}

const myJsonSchema3 = {
  "$defs": {
    "NodeEnd": {
      "type": "object",
      "properties": {
        "text2": { "type": "string" },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/NodeEnd"
          }
        }
      },
      "required": ["text2"],
      "additionalProperties": false

    },
    "NodeItems": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "object",
            "properties": {
              "text": { "type": "string", "default": "sub-title" },
              "items": { "$ref": "#/$defs/NodeItems" }
            },
            "required": ["text"],
            "additionalProperties": false,
          },
          {
            "$ref": "#/$defs/NodeEnd"
          }
        ]
      }
    }
  },
  "properties": {
    "root": {
      "$ref": "#/$defs/NodeItems"
    }
  }
  // "$ref": "#/$defs/NodeItems",
}

const jsonObject = reactive(
  [
    {

      // "text": "text 1",
      "items": [
        {
          "text": "text 2",
          "items": [],
        },
        {
          "text": "text 3",
          "items": [
            {
              "__sysdata__": {
                "schema": "base2",
                "source": {}
              },
              "text": "text 4",
            }
          ],
        },
      ],
      "__sysdata__": {
        "schema": "base",
        "source": {}
      }
    }
  ]
);

const jsonObject2 =
  [
    {
      "__sysdata__": {
        "schema": "base",
        "source": {}
      },
      // "text": "text 1",
      "items": [

      ]
    }
  ]
  ;

console.log("____________________");

// const result = JSONPath({ path: '$..__sysdata__.schema^^', resultType: 'pointer', json: jsonObject });
// console.log(result);

// TODO: 
// 1. Deepcopy json without __sysdata field
// 2. $..__sysdata__.schema^^ -- ^ is parent object
// 3. установить поля валидаций в объект


const schema = compileSchema(myJsonSchema, {
  getDataDefaultOptions: {
    addOptionalProps: true,
    extendDefaults: true,
    recursionLimit: 5
  }
});
const schema2 = compileSchema(myJsonSchema3, {
  getDataDefaultOptions: {
    addOptionalProps: true,
    extendDefaults: true,
    recursionLimit: 5
  }
});


function getAllProperties(schema) {
  const properties = [];

  function processSchema(sch, path = '') {
    if (sch.properties) {
      Object.keys(sch.properties).forEach((key) => {
        const propPath = path ? `${path}.${key}` : key;
        properties.push({ name: propPath, type: sch.properties[key].type });

        if (sch.properties[key].properties) {
          processSchema(sch.properties[key], propPath);
        }
      });
    }

    if (sch.anyOf) {
      sch.anyOf.forEach((subSchema) => {
        processSchema(subSchema, path);
      });
    }

    if (sch.oneOf) {
      sch.oneOf.forEach((subSchema) => {
        processSchema(subSchema, path);
      });
    }

    if (sch.allOf) {
      sch.allOf.forEach((subSchema) => {
        processSchema(subSchema, path);
      });
    }

    if (sch.items) {
      processSchema(sch.items, path);
      properties.push({ type: sch.type, });

    }
  }

  processSchema(schema);

  return properties;
}


// const pointer = "#/root/0/items";
// const pointer2 = "#/root/0/items";
const pointer = "#";
console.log(pointer);
const obj = { root: [{}] }
const r = schema.getNode(pointer, obj, { withSchemaWarning: true })
console.log("error", r.error);
console.log("node", r.node);
console.log("schema", r.node?.schema);
console.log("toSchemaNodes", r.node?.toSchemaNodes());
console.log("toDataNodes", r.node?.toDataNodes(obj, pointer));
console.log("getAllProperties", getAllProperties(r.node?.schema));

const pointer2 = "#/root";
console.log(pointer2);
// const obj2 =  { root: [{ text2: "asd" }] }
const obj2 = { root: [] }
const r2 = schema2.getNode(pointer2, obj2, { withSchemaWarning: true })
console.log("error2", r2.error);
console.log("node2", r2.node);
console.log("schema2", r2.node?.schema);
console.log("toSchemaNodes2", r2.node?.toSchemaNodes());
console.log("toDataNodes2", r2.node?.toDataNodes(obj2, pointer2));
console.log("getData", r2.node?.getData());

const reduce = r2.node?.reduceNode(obj2);
console.log("getAllProperties2", getAllProperties(reduce?.node?.schema));

// const child  = node?.getChildSelection();
// console.log("child", child);

// const schemaNode = schema.toSchemaNodes();
// console.log(schemaNode);

// const schemaNode = schema.toDataNodes(jsonObject2, "#/0/");
// console.log(schemaNode?.map((dataNode) => ({
//     schema: dataNode.node.schema,
//     value: dataNode.value,
//     pointer: dataNode.pointer
// })));

// validate data and collect errors if invalid
// const { valid, errors } = schema.validate(jsonObject);
// console.log(valid, errors);

// let listSub = schema.getData(undefined,  { addOptionalProps: true });
// console.log(listSub);

// console.log( schema.getNode("#").node?.getData(jsonObject,  { addOptionalProps: true }));
// console.log( schema.getNode("#",jsonObject).node?.getData(jsonObject,  { addOptionalProps: true }));
// console.log( schema.getNode("#/").node?.getData(undefined,  { addOptionalProps: true }));



// console.log(Object.keys(schema.getNode("#/").node?.properties || {}));
// console.log(getAllProperties(schema.getNode("#/").node?.schema));
// debugger;

// const pointer = "#/"; 
// const {node , error} = schema.getNode(pointer, {}, {withSchemaWarning:true});
// console.log(error);
// console.log(node);



// console.log(schema.toJSON());


// const schemaNode = schema.getNode("#").node?.getChildSelection("items");
// const schemaNode = schema.getData(undefined, { recursionLimit: 2, addOptionalProps: true });
// const schemaNode = schema.getData({  }, { recursionLimit: 10, addOptionalProps: true });
// console.log(schemaNode);

// const schemaNode = schema.toSchemaNodes();
// console.log(schemaNode);

//schema.toSchemaNodes(
// console.log( schema.getNode("#",jsonObject).node?.getData(jsonObject,  { addOptionalProps: true }));

import { useJSONTreeViewStore } from '../store/jsonTreeViewStore.ts';
// import JSONTreeNode from './JSONTreeNode.vue';

const store = useJSONTreeViewStore();


</script>
<!-- @click="addItem(item.pointer, item.newValue)" -->

<template>
  <v-treeview
    :items="store.items"
    density="compact"
    item-value="pointer"
    activatable
    open-on-click
  >
    <template #prepend="{ item, isOpen }">
      <v-icon
        v-if="item.children"
        :icon="isOpen ? 'mdi-folder-open' : 'mdi-folder'"
      />
    </template>

    <template #title="{ item }">
      <JSONTreeNode :node="item" />
    </template>
  </v-treeview>
</template>
