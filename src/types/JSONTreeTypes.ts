export enum JSONTreeNodeState {
  normal, // обычное поведение
  fixed, // нода заблокирована для изменений
  suggested // нода предложено пользователю, не содержиться исходном в дереве
}


export type JSONTreeNode = {
  pointer: string;
  field: string;

  // установка в поле объекта, породит реактивность и обновит детей
  // в ноде содержит сам вложенный объект или массив, а в детях он же разложенный
  value: unknown;

  // для отображения дерева
  children?: JSONTreeNode[];

  // предлагаемые варианты установки значений
  valueVariant?: unknown[];

  // варианты как установить ноду, или для новых нод выбрать
  nodeVariant?: JSONTreeNode[];

  state: JSONTreeNodeState;
}
