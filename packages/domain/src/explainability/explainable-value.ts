import type { RuleCatalogEntry } from '../rules/rule-sources';
import type { RuleReference, SourceType } from '../types/common';

export interface ExplainableValue<TValue extends string = string> extends RuleReference {
  name: string;
  value: TValue;
  sourceType: SourceType;
  explanation?: string;
  citations?: ReadonlyArray<string>;
}

export type CreateExplainableValueInput<TValue extends string = string> = Omit<
  ExplainableValue<TValue>,
  'id' | 'version'
> & {
  rule?: Pick<RuleCatalogEntry, 'id' | 'version'>;
};

export function createExplainableValue<TValue extends string = string>(
  input: CreateExplainableValueInput<TValue>,
): ExplainableValue<TValue> {
  return {
    id: input.rule?.id ?? 'manual',
    version: input.rule?.version ?? 'unversioned',
    name: input.name,
    value: input.value,
    sourceType: input.sourceType,
    explanation: input.explanation,
    citations: input.citations,
  };
}

export function explainableValueFromRule<TValue extends string = string>(
  rule: Pick<RuleCatalogEntry, 'id' | 'version'>,
  value: Omit<CreateExplainableValueInput<TValue>, 'rule'>,
): ExplainableValue<TValue> {
  return createExplainableValue({
    ...value,
    rule,
  });
}
