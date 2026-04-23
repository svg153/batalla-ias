import type { StoredAnalysisRecord } from './analysis-record.js';

export interface AnalysisRepositoryCapabilities {
  provider: 'memory';
  supportsDurableStorage: boolean;
}

export interface AnalysisRepository {
  readonly capabilities: AnalysisRepositoryCapabilities;
  save(analysis: StoredAnalysisRecord): Promise<StoredAnalysisRecord>;
  findById(analysisId: string): Promise<StoredAnalysisRecord | null>;
  delete(analysisId: string): Promise<boolean>;
}

const cloneAnalysis = (analysis: StoredAnalysisRecord) => structuredClone(analysis);

export class InMemoryAnalysisRepository implements AnalysisRepository {
  readonly capabilities: AnalysisRepositoryCapabilities = {
    provider: 'memory',
    supportsDurableStorage: false,
  };

  readonly #store = new Map<string, StoredAnalysisRecord>();

  async save(analysis: StoredAnalysisRecord) {
    const copy = cloneAnalysis(analysis);
    this.#store.set(copy.analysis.id, copy);
    return cloneAnalysis(copy);
  }

  async findById(analysisId: string) {
    const found = this.#store.get(analysisId);

    if (!found) {
      return null;
    }

    if (hasExpired(found)) {
      this.#store.delete(analysisId);
      return null;
    }

    return cloneAnalysis(found);
  }

  async delete(analysisId: string) {
    return this.#store.delete(analysisId);
  }
}

const hasExpired = (analysis: StoredAnalysisRecord) => {
  if (!analysis.analysis.expiresAt) {
    return false;
  }

  const expiry = new Date(analysis.analysis.expiresAt);

  return Number.isFinite(expiry.getTime()) && expiry.getTime() <= Date.now();
};

export const createAnalysisRepository = () => new InMemoryAnalysisRepository();
