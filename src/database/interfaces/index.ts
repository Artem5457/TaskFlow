export type BaseCreationOmittedFields = 'id' | 'createdAt' | 'updatedAt';

export type OptionalTaskFields =
  | BaseCreationOmittedFields
  | 'status'
  | 'priority'
  | 'description'
  | 'dueDate'
  | 'assignedToId';
