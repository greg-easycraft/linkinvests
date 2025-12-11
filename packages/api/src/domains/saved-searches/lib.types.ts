import type { SavedSearch } from '@linkinvests/shared';

export abstract class SavedSearchRepository {
  abstract findAllByUserId(userId: string): Promise<SavedSearch[]>;
  abstract findById(id: string): Promise<SavedSearch | null>;
  abstract create(data: {
    userId: string;
    name: string;
    url: string;
  }): Promise<SavedSearch>;
  abstract delete(id: string): Promise<boolean>;
  abstract countByUserId(userId: string): Promise<number>;
}
