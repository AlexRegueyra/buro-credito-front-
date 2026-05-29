/**
 * Common types used across the application
 */

export type Status = 'A' | 'I';

export type ID = string;

export interface TimestampedEntity {
  createdAt: string;
  updatedAt: string;
}

export interface BaseEntity extends TimestampedEntity {
  id: ID;
  status: Status;
}
