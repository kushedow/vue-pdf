import { defineStore } from 'pinia'
import { computed, reactive, ref, toRaw, triggerRef } from 'vue'
import JSONPointer from '@sagold/json-pointer';
import { JSONTreeNodeState, type JSONTreeNode } from '../types/JSONTreeTypes.ts';

export const useJSONTreeViewStore = defineStore(`jsonTreeView`, () => {
  const count = ref(0)

  const sysFieldName = '__sysdata__';

  const rootObject = ref(
    [
      {
        "text": "text 1",
        "text2": "text 1_4",
        "items": [
          {
            "text": "text 2",
            "text2": "text 2_4",
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
    ]);

  function load(object: unknown) {
    rootObject.value = object;
  }

  function setNode(pointer: string, data: unknown) {
    JSONPointer.set(rootObject.value, pointer, data);
    console.log(pointer, rootObject.value, JSON.stringify(rootObject.value));
  }

  function renameNode(pointer: string, name: string) {
    const [parent, property] = JSONPointer.splitLast(pointer);
    const data = JSONPointer.get(rootObject.value, parent);

    // изменение поля объекта с сохранением очередности полей
    const pairs = Object.entries(data);
    const index = pairs.findIndex(([key]) => key === property);
    if (index !== -1)
      pairs[index] = [name, pairs[index][1]];

    const res = Object.fromEntries(pairs);

    JSONPointer.set(rootObject.value, parent, res);
    // console.log(res, rootObject.value);
  }


  const delNode = (pointer: string) => {
    JSONPointer.remove(rootObject, pointer);
  }

  function moveNode(pointer: string, pointerNextTo: string) {
    const [parent, property] = JSONPointer.splitLast(pointer);
    const [parentNextTo, propertyNextTo] = JSONPointer.splitLast(pointerNextTo);
    const data = toRaw(JSONPointer.get(rootObject.value, pointer));
    JSONPointer.remove(rootObject.value, pointer);

    const objTo = toRaw(JSONPointer.get(rootObject.value, parentNextTo));

    // изменение поля объекта с сохранением очередности полей
    const pairs = Object.entries(objTo);
    const index = pairs.findIndex(([key]) => key === propertyNextTo);
    if (index !== -1)
      pairs.splice( index, 0, [property, data])

    console.log(pairs);
    const res = Object.fromEntries(pairs);
    console.log(res);

    JSONPointer.set(rootObject.value, parentNextTo, res);
    // triggerRef(rootObject)

    console.log(pointer, pointerNextTo, rootObject.value);
  }


  function moveNode_(pointer: string, pointerNextTo: string)
  {
    function insertField(obj, pointer, field, value) {
      const parts = pointer.split('/').filter(Boolean);
      let currentObj = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!currentObj[parts[i]]) {
          currentObj[parts[i]] = {};
        }
        currentObj = currentObj[parts[i]];
      }

      const lastKey = parts[parts.length - 1];
      const keys = Object.keys(currentObj);
      const index = keys.indexOf(lastKey);
      if (index !== -1) {
        const newArr = keys.slice(0, index + 1);
        newArr.push(field);
        newArr.push(...keys.slice(index + 1));
        const newObj = {};
        let k = 0;
        for (const key of newArr) {
          if (k === 0) {
            newObj[key] = currentObj[key];
          } else if (k === 1) {
            newObj[field] = value;
            newObj[key] = currentObj[key];
          } else {
            newObj[key] = currentObj[key];
          }
          k++;
        }
        Object.assign(currentObj, newObj);
      }

      return obj;
    }

    rootObject.value = insertField(rootObject.value, pointerNextTo, "asd", { s:"sd"});
    console.log(pointer, pointerNextTo, rootObject.value);
  }


  const items = computed(() => {
    const convertToItems = (obj: any, parent_pointer: string) => {
      // if (typeof obj !== 'object') return [];

      const result: JSONTreeNode[] = [];

      Object.keys(obj).forEach(key => {
        if (sysFieldName === key) return;




        const value = obj[key];


        const pointer = `${parent_pointer}/${key}`;

        if (typeof value === 'object' && !Array.isArray(value)) {
          const children = convertToItems(value, pointer);
          result.push({ pointer, state: JSONTreeNodeState.normal, field: key, children, valueVariant: children, value });

        } else if (Array.isArray(value)) {
          const children = convertToItems(value, pointer);
          result.push({ pointer, state: JSONTreeNodeState.normal, field: key, children, value });
        } else {
          result.push({ pointer, state: JSONTreeNodeState.normal, field: `${key}`, value });
        }
      });

      if (Array.isArray(obj)) {
        const nodeVariant = [
          { pointer: `${parent_pointer}/${obj.length}`, state: JSONTreeNodeState.suggested, field: `[new ${obj.length}]`, value: [] },
          { pointer: `${parent_pointer}/${obj.length}`, state: JSONTreeNodeState.suggested, field: `[new 2 ${obj.length}]`, value: [] }
        ];
        result.push({ pointer: `${parent_pointer}/${obj.length}`, state: JSONTreeNodeState.suggested, field: `[new ${obj.length}]`, value: [], nodeVariant });
      } else {
        const newField = 'new';
        result.push({ pointer: `${parent_pointer}/${newField}`, state: JSONTreeNodeState.suggested, field: `${newField}`, value: {} });
      }

      return result;
    };

    const r = reactive(convertToItems(rootObject.value, '#'));
    console.log(r);
    return r;
  });

  return { items, load, setNode, delNode, moveNode, renameNode }
})
