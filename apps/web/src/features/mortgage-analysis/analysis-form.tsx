import { useMemo, useState } from 'react';
import type {
  AnalysisDraft,
  CreateAnalysisRequest,
  DraftHouseholdProfile,
  DraftMortgageSection,
  DraftOfferSection,
  DraftSwitchCosts,
  IncomeStability,
  RetentionPreference
} from './types';

interface AnalysisFormProps {
  isSubmitting?: boolean;
  submissionError?: string | null;
  onSubmit: (request: CreateAnalysisRequest) => Promise<void> | void;
}

type ErrorMap = Partial<Record<string, string>>;

const defaultDraft: AnalysisDraft = {
  retentionPreference: 'session_only',
  horizonMonths: '120',
  currentMortgage: {
    pendingPrincipal: '186000',
    remainingMonths: '276',
    nominalAnnualRate: '3.65',
    currentInstallment: '948',
    recurringCostsMonthly: '18'
  },
  alternativeOffer: {
    hasBonusVariant: true,
    withoutBonus: {
      pendingPrincipal: '186000',
      remainingMonths: '276',
      nominalAnnualRate: '2.85',
      recurringCostsMonthly: '0',
      linkedProductsMonthlyCost: '0',
      bonificationRateDelta: '0'
    },
    withBonus: {
      pendingPrincipal: '186000',
      remainingMonths: '276',
      nominalAnnualRate: '2.45',
      recurringCostsMonthly: '0',
      linkedProductsMonthlyCost: '42',
      bonificationRateDelta: '0.40'
    }
  },
  switchCosts: {
    agency: '350',
    notary: '690',
    appraisal: '390',
    management: '325',
    cancellationFee: '1200',
    openingFee: '0',
    other: '0',
    otherDescription: 'Otros costes asociados'
  },
  householdProfile: {
    netMonthlyIncome: '4150',
    monthlyObligations: '380',
    incomeStability: 'stable',
    notes: ''
  }
};

export function AnalysisForm({
  isSubmitting = false,
  submissionError,
  onSubmit
}: AnalysisFormProps) {
  const [draft, setDraft] = useState<AnalysisDraft>(defaultDraft);
  const [errors, setErrors] = useState<ErrorMap>({});

  const summary = useMemo(
    () => [
      draft.alternativeOffer.hasBonusVariant
        ? 'Comparas actual, oferta base y variante bonificada.'
        : 'Comparas solo actual y oferta base porque no hay bonificación declarada.',
      draft.retentionPreference === 'session_only'
        ? 'Los datos se plantean para quedarse solo en esta sesión.'
        : 'Guardar análisis exige dejar claro que la retención es temporal, no permanente.',
      'La asequibilidad se explica con los umbrales visibles del 35% y 40%.'
    ],
    [draft.alternativeOffer.hasBonusVariant, draft.retentionPreference]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(toRequest(draft));
  };

  return (
    <form className="analysis-form-card" onSubmit={handleSubmit}>
      <header className="analysis-form-card__header">
        <div>
          <p className="eyebrow">Hoja de trabajo</p>
          <h2>Captura lo que cambia de verdad el coste</h2>
        </div>
        <p className="analysis-form-card__intro">
          Esta hoja separa hipoteca actual, oferta base, bonificaciones, gastos de cambio y margen
          del hogar para que nadie confunda una cuota más baja con una decisión mejor.
        </p>
      </header>

      <div className="analysis-form-card__summary worksheet-summary">
        {summary.map((item) => (
          <span key={item} className="tag">
            {item}
          </span>
        ))}
      </div>

      <section className="form-section">
        <div className="form-section__heading">
          <div>
            <p className="eyebrow">Privacidad primero</p>
            <h3>Preferencia de retención</h3>
          </div>
          <p>
            La propiedad del análisis depende de este navegador y de la sesión que abra la API. Si
            eliges guardar, la UI debe decirte cuánto dura y si el backend realmente puede hacerlo.
          </p>
        </div>
        <div className="choice-grid">
          <ChoiceCard
            checked={draft.retentionPreference === 'session_only'}
            description="Para comparar sin dejar rastro más allá de esta sesión activa."
            id="retention-session"
            name="retentionPreference"
            onChange={() => updateRootField('retentionPreference', 'session_only')}
            title="Solo sesión"
          />
          <ChoiceCard
            checked={draft.retentionPreference === 'save_analysis'}
            description="Para volver después, pero sin prometer almacenamiento permanente."
            id="retention-save"
            name="retentionPreference"
            onChange={() => updateRootField('retentionPreference', 'save_analysis')}
            title="Guardar análisis"
          />
        </div>
        <div className="form-note">
          {draft.retentionPreference === 'session_only'
            ? 'Lectura honesta: el análisis debería caducar con la sesión o tras inactividad. Úsalo para probar sin dejar datos sensibles guardados más tiempo del necesario.'
            : 'Lectura honesta: guardar no significa archivo indefinido. El MVP habla de retención temporal y la UI mostrará si el backend aún está en memoria.'}
        </div>
      </section>

      <section className="form-section">
        <div className="form-section__heading">
          <div>
            <p className="eyebrow">Horizonte</p>
            <h3>Ventana de comparación</h3>
          </div>
          <p>
            El ahorro solo tiene sentido dentro del periodo que decides mirar. Si el horizonte supera
            el plazo restante, aquí se bloquea antes de enviar nada ambiguo.
          </p>
        </div>
        <div className="form-grid form-grid--compact">
          <Field
            description="Meses en los que compararemos intereses, gastos del cambio y ahorro acumulado."
            error={errors.horizonMonths}
            id="horizonMonths"
            label="Horizonte de evaluación (meses)"
            min={1}
            onChange={(value) => updateRootField('horizonMonths', value)}
            step="1"
            type="number"
            value={draft.horizonMonths}
          />
        </div>
      </section>

      <MortgageSection
        description="La hipoteca que hoy manda en tu cuenta. Aquí importa lo que queda por pagar, no lo que ya pasó."
        errors={errors}
        fields={draft.currentMortgage}
        prefix="currentMortgage"
        title="Hipoteca actual"
        updateField={updateCurrentMortgageField}
      />

      <OfferSection
        description="La oferta base es la referencia obligatoria. Sin ella, no hay comparación seria."
        errors={errors}
        fields={draft.alternativeOffer.withoutBonus}
        prefix="alternativeOffer.withoutBonus"
        title="Oferta alternativa sin bonificaciones"
        updateField={(field, value) => updateOfferField('withoutBonus', field, value)}
      />

      <section className="form-section">
        <div className="form-section__heading">
          <div>
            <p className="eyebrow">Escenario bonificado</p>
            <h3>¿Existe de verdad una variante con bonificaciones?</h3>
          </div>
          <p>
            Si la oferta no trae bonificaciones explícitas, no inventamos un tercer escenario. La UI
            debe enseñar dos escenarios y decirlo con claridad.
          </p>
        </div>
        <div className="choice-grid">
          <ChoiceCard
            checked={!draft.alternativeOffer.hasBonusVariant}
            description="La comparación se quedará en hipoteca actual + oferta base."
            id="bonus-off"
            name="bonusVariant"
            onChange={() => updateBonusVariant(false)}
            title="No hay bonificaciones"
          />
          <ChoiceCard
            checked={draft.alternativeOffer.hasBonusVariant}
            description="La bonificación baja el tipo, pero también puede traer costes o vinculaciones."
            id="bonus-on"
            name="bonusVariant"
            onChange={() => updateBonusVariant(true)}
            title="Sí, existe variante bonificada"
          />
        </div>
        <div className="form-note">
          {draft.alternativeOffer.hasBonusVariant
            ? 'Guardrail: activa esta variante solo si cambia el tipo o aparecen costes vinculados reales. Si es igual que la oferta base, la UI la bloquea porque sería maquillaje.'
            : 'Guardrail: al desactivar bonificaciones, el resultado mostrará explícitamente que no existe escenario bonificado.'}
        </div>
      </section>

      {draft.alternativeOffer.hasBonusVariant ? (
        <OfferSection
          description="Aquí queremos saber si el tipo más bajo compensa el coste de los productos vinculados."
          errors={errors}
          fields={draft.alternativeOffer.withBonus}
          includeBonusFields
          prefix="alternativeOffer.withBonus"
          sectionError={errors['alternativeOffer.withBonus']}
          title="Oferta con bonificaciones"
          updateField={(field, value) => updateOfferField('withBonus', field, value)}
        />
      ) : null}

      <section className="form-section">
        <div className="form-section__heading">
          <div>
            <p className="eyebrow">Gastos del cambio</p>
            <h3>Costes de notaría, cancelación y compañía</h3>
          </div>
          <p>
            Si el usuario puede olvidarlos, la interfaz tiene que obligarle a mirarlos de frente.
          </p>
        </div>

        <div className="form-grid">
          <Field
            description="Intermediación o asesoría externa."
            error={errors['switchCosts.agency']}
            id="switchCosts.agency"
            label="Agencia"
            min={0}
            onChange={(value) => updateSwitchCostField('agency', value)}
            step="0.01"
            type="number"
            value={draft.switchCosts.agency}
          />
          <Field
            description="Gasto de firma y formalización."
            error={errors['switchCosts.notary']}
            id="switchCosts.notary"
            label="Notaría"
            min={0}
            onChange={(value) => updateSwitchCostField('notary', value)}
            step="0.01"
            type="number"
            value={draft.switchCosts.notary}
          />
          <Field
            description="Tasación o re-tasación exigida."
            error={errors['switchCosts.appraisal']}
            id="switchCosts.appraisal"
            label="Tasación"
            min={0}
            onChange={(value) => updateSwitchCostField('appraisal', value)}
            step="0.01"
            type="number"
            value={draft.switchCosts.appraisal}
          />
          <Field
            description="Gestoría, trámites y papeleo."
            error={errors['switchCosts.management']}
            id="switchCosts.management"
            label="Gestoría"
            min={0}
            onChange={(value) => updateSwitchCostField('management', value)}
            step="0.01"
            type="number"
            value={draft.switchCosts.management}
          />
          <Field
            description="Cancelación, subrogación o comisión relevante."
            error={errors['switchCosts.cancellationFee']}
            id="switchCosts.cancellationFee"
            label="Cancelación / comisión"
            min={0}
            onChange={(value) => updateSwitchCostField('cancellationFee', value)}
            step="0.01"
            type="number"
            value={draft.switchCosts.cancellationFee}
          />
          <Field
            description="Comisión de apertura si aplica."
            error={errors['switchCosts.openingFee']}
            id="switchCosts.openingFee"
            label="Apertura"
            min={0}
            onChange={(value) => updateSwitchCostField('openingFee', value)}
            step="0.01"
            type="number"
            value={draft.switchCosts.openingFee}
          />
          <Field
            description="Cualquier coste que no quieres esconder bajo la alfombra."
            error={errors['switchCosts.other']}
            id="switchCosts.other"
            label="Otros costes"
            min={0}
            onChange={(value) => updateSwitchCostField('other', value)}
            step="0.01"
            type="number"
            value={draft.switchCosts.other}
          />
          <Field
            description="Describe el concepto si lo usas."
            error={errors['switchCosts.otherDescription']}
            id="switchCosts.otherDescription"
            label="Descripción de otros costes"
            onChange={(value) => updateSwitchCostField('otherDescription', value)}
            value={draft.switchCosts.otherDescription}
          />
        </div>
      </section>

      <section className="form-section">
        <div className="form-section__heading">
          <div>
            <p className="eyebrow">Asequibilidad</p>
            <h3>Perfil del hogar</h3>
          </div>
          <p>
            No basta con que la opción gane en coste: también tiene que caber sin ahogar al hogar.
          </p>
        </div>
        <div className="form-grid">
          <Field
            description="Ingreso neto mensual del hogar. Déjalo vacío solo si aún no quieres evaluar asequibilidad."
            error={errors['householdProfile.netMonthlyIncome']}
            id="householdProfile.netMonthlyIncome"
            label="Ingresos netos mensuales"
            min={0}
            onChange={(value) => updateHouseholdField('netMonthlyIncome', value)}
            step="0.01"
            type="number"
            value={draft.householdProfile.netMonthlyIncome}
          />
          <Field
            description="Cuotas y obligaciones ya existentes."
            error={errors['householdProfile.monthlyObligations']}
            id="householdProfile.monthlyObligations"
            label="Obligaciones mensuales"
            min={0}
            onChange={(value) => updateHouseholdField('monthlyObligations', value)}
            step="0.01"
            type="number"
            value={draft.householdProfile.monthlyObligations}
          />
          <SelectField
            description="Si los ingresos bailan, la interfaz debe avisarlo con todas las letras."
            id="householdProfile.incomeStability"
            label="Estabilidad de ingresos"
            onChange={(value) => updateHouseholdField('incomeStability', value as IncomeStability)}
            options={[
              { label: 'Estables', value: 'stable' },
              { label: 'Variables', value: 'variable' },
              { label: 'Sin confirmar', value: 'unknown' }
            ]}
            value={draft.householdProfile.incomeStability}
          />
          <TextAreaField
            description="Notas para explicar hipótesis o incertidumbres. Si los ingresos son variables, esta explicación deja de ser opcional."
            error={errors['householdProfile.notes']}
            id="householdProfile.notes"
            label="Notas del hogar"
            onChange={(value) => updateHouseholdField('notes', value)}
            value={draft.householdProfile.notes}
          />
        </div>
      </section>

      {submissionError ? <div className="form-error-banner">{submissionError}</div> : null}

      <footer className="analysis-form-card__footer">
        <div>
          <p className="eyebrow">Guardrails visibles</p>
          <p>
            La salida no va a maquillar si la API aún no compara, si no existe bonificación o si los
            ingresos del hogar siguen siendo una hipótesis.
          </p>
        </div>
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Calculando comparación…' : 'Ver coste real y recomendación'}
        </button>
      </footer>
    </form>
  );

  function updateRootField<K extends keyof Pick<AnalysisDraft, 'retentionPreference' | 'horizonMonths'>>(
    field: K,
    value: AnalysisDraft[K]
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateCurrentMortgageField<K extends keyof DraftMortgageSection>(
    field: K,
    value: DraftMortgageSection[K]
  ) {
    setDraft((current) => ({
      ...current,
      currentMortgage: {
        ...current.currentMortgage,
        [field]: value
      }
    }));
  }

  function updateOfferField<K extends keyof DraftOfferSection>(
    variant: 'withoutBonus' | 'withBonus',
    field: K,
    value: DraftOfferSection[K]
  ) {
    setDraft((current) => ({
      ...current,
      alternativeOffer: {
        ...current.alternativeOffer,
        [variant]: {
          ...current.alternativeOffer[variant],
          [field]: value
        }
      }
    }));
  }

  function updateBonusVariant(nextValue: boolean) {
    setDraft((current) => ({
      ...current,
      alternativeOffer: {
        ...current.alternativeOffer,
        hasBonusVariant: nextValue
      }
    }));
  }

  function updateSwitchCostField<K extends keyof DraftSwitchCosts>(
    field: K,
    value: DraftSwitchCosts[K]
  ) {
    setDraft((current) => ({
      ...current,
      switchCosts: {
        ...current.switchCosts,
        [field]: value
      }
    }));
  }

  function updateHouseholdField<K extends keyof DraftHouseholdProfile>(
    field: K,
    value: DraftHouseholdProfile[K]
  ) {
    setDraft((current) => ({
      ...current,
      householdProfile: {
        ...current.householdProfile,
        [field]: value
      }
    }));
  }
}

function MortgageSection({
  title,
  description,
  prefix,
  fields,
  errors,
  updateField
}: {
  title: string;
  description: string;
  prefix: string;
  fields: DraftMortgageSection;
  errors: ErrorMap;
  updateField: <K extends keyof DraftMortgageSection>(
    field: K,
    value: DraftMortgageSection[K]
  ) => void;
}) {
  return (
    <section className="form-section">
      <div className="form-section__heading">
        <div>
          <p className="eyebrow">Escenario base</p>
          <h3>{title}</h3>
        </div>
        <p>{description}</p>
      </div>

      <div className="form-grid">
        <Field
          description="Principal pendiente a día de hoy."
          error={errors[`${prefix}.pendingPrincipal`]}
          id={`${prefix}.pendingPrincipal`}
          label="Capital pendiente"
          min={0}
          onChange={(value) => updateField('pendingPrincipal', value)}
          step="0.01"
          type="number"
          value={fields.pendingPrincipal}
        />
        <Field
          description="Meses que quedan realmente."
          error={errors[`${prefix}.remainingMonths`]}
          id={`${prefix}.remainingMonths`}
          label="Plazo restante (meses)"
          min={1}
          onChange={(value) => updateField('remainingMonths', value)}
          step="1"
          type="number"
          value={fields.remainingMonths}
        />
        <Field
          description="Tipo nominal anual."
          error={errors[`${prefix}.nominalAnnualRate`]}
          id={`${prefix}.nominalAnnualRate`}
          label="Tipo nominal anual (%)"
          min={0}
          onChange={(value) => updateField('nominalAnnualRate', value)}
          step="0.01"
          type="number"
          value={fields.nominalAnnualRate}
        />
        <Field
          description="Si no lo das, el resultado lo marcará como estimación condicionada."
          error={errors[`${prefix}.currentInstallment`]}
          id={`${prefix}.currentInstallment`}
          label="Cuota declarada (opcional)"
          min={0}
          onChange={(value) => updateField('currentInstallment', value)}
          step="0.01"
          type="number"
          value={fields.currentInstallment}
        />
        <Field
          description="Seguros u otros costes recurrentes ligados a este escenario."
          error={errors[`${prefix}.recurringCostsMonthly`]}
          id={`${prefix}.recurringCostsMonthly`}
          label="Costes recurrentes mensuales"
          min={0}
          onChange={(value) => updateField('recurringCostsMonthly', value)}
          step="0.01"
          type="number"
          value={fields.recurringCostsMonthly}
        />
      </div>
    </section>
  );
}

function OfferSection({
  title,
  description,
  prefix,
  fields,
  errors,
  updateField,
  includeBonusFields = false,
  sectionError
}: {
  title: string;
  description: string;
  prefix: string;
  fields: DraftOfferSection;
  errors: ErrorMap;
  includeBonusFields?: boolean;
  sectionError?: string;
  updateField: <K extends keyof DraftOfferSection>(
    field: K,
    value: DraftOfferSection[K]
  ) => void;
}) {
  return (
    <section className="form-section">
      <div className="form-section__heading">
        <div>
          <p className="eyebrow">{includeBonusFields ? 'Bonificación' : 'Oferta'}</p>
          <h3>{title}</h3>
        </div>
        <p>{description}</p>
      </div>

      {sectionError ? <div className="form-error-banner">{sectionError}</div> : null}

      <div className="form-grid">
        <Field
          description="Normalmente coincide con el capital pendiente a subrogar."
          error={errors[`${prefix}.pendingPrincipal`]}
          id={`${prefix}.pendingPrincipal`}
          label="Capital pendiente"
          min={0}
          onChange={(value) => updateField('pendingPrincipal', value)}
          step="0.01"
          type="number"
          value={fields.pendingPrincipal}
        />
        <Field
          description="Plazo sobre el que el banco calcula esta oferta."
          error={errors[`${prefix}.remainingMonths`]}
          id={`${prefix}.remainingMonths`}
          label="Plazo restante (meses)"
          min={1}
          onChange={(value) => updateField('remainingMonths', value)}
          step="1"
          type="number"
          value={fields.remainingMonths}
        />
        <Field
          description="Tipo nominal anual ofertado."
          error={errors[`${prefix}.nominalAnnualRate`]}
          id={`${prefix}.nominalAnnualRate`}
          label="Tipo nominal anual (%)"
          min={0}
          onChange={(value) => updateField('nominalAnnualRate', value)}
          step="0.01"
          type="number"
          value={fields.nominalAnnualRate}
        />
        <Field
          description="Seguros u otros costes recurrentes específicos de esta variante."
          error={errors[`${prefix}.recurringCostsMonthly`]}
          id={`${prefix}.recurringCostsMonthly`}
          label="Costes recurrentes mensuales"
          min={0}
          onChange={(value) => updateField('recurringCostsMonthly', value)}
          step="0.01"
          type="number"
          value={fields.recurringCostsMonthly}
        />
        {includeBonusFields ? (
          <>
            <Field
              description="Cuánto cuesta cada mes mantener las vinculaciones."
              error={errors[`${prefix}.linkedProductsMonthlyCost`]}
              id={`${prefix}.linkedProductsMonthlyCost`}
              label="Productos vinculados / mes"
              min={0}
              onChange={(value) => updateField('linkedProductsMonthlyCost', value)}
              step="0.01"
              type="number"
              value={fields.linkedProductsMonthlyCost}
            />
            <Field
              description="Rebaja del tipo frente a la oferta base."
              error={errors[`${prefix}.bonificationRateDelta`]}
              id={`${prefix}.bonificationRateDelta`}
              label="Reducción por bonificación (%)"
              min={0}
              onChange={(value) => updateField('bonificationRateDelta', value)}
              step="0.01"
              type="number"
              value={fields.bonificationRateDelta}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  description,
  value,
  onChange,
  error,
  type = 'text',
  min,
  step
}: {
  id: string;
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: React.HTMLInputTypeAttribute;
  min?: number;
  step?: string;
}) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <input
        aria-invalid={Boolean(error)}
        className="field__input"
        id={id}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        step={step}
        type={type}
        value={value}
      />
      {description ? <span className="field__description">{description}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}

function SelectField({
  id,
  label,
  description,
  value,
  onChange,
  options
}: {
  id: string;
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <select
        className="field__input"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description ? <span className="field__description">{description}</span> : null}
    </label>
  );
}

function TextAreaField({
  id,
  label,
  description,
  value,
  onChange,
  error
}: {
  id: string;
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="field field--full" htmlFor={id}>
      <span className="field__label">{label}</span>
      <textarea
        className="field__input field__input--textarea"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        value={value}
      />
      {description ? <span className="field__description">{description}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}

function ChoiceCard({
  id,
  name,
  title,
  description,
  checked,
  onChange
}: {
  id: string;
  name: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className={`choice-card ${checked ? 'choice-card--checked' : ''}`} htmlFor={id}>
      <input checked={checked} id={id} name={name} onChange={onChange} type="radio" />
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </label>
  );
}

function validateDraft(draft: AnalysisDraft): ErrorMap {
  const errors: ErrorMap = {};
  const horizonMonths = Number.parseInt(draft.horizonMonths, 10);

  requirePositiveInteger(errors, 'horizonMonths', draft.horizonMonths, 'Define un horizonte mayor que 0.');

  validateMortgage(errors, 'currentMortgage', draft.currentMortgage, true);
  validateOffer(errors, 'alternativeOffer.withoutBonus', draft.alternativeOffer.withoutBonus, false);

  if (draft.alternativeOffer.hasBonusVariant) {
    validateOffer(errors, 'alternativeOffer.withBonus', draft.alternativeOffer.withBonus, true);
    validateDistinctBonusVariant(errors, draft);
  }

  if (Number.isInteger(horizonMonths)) {
    requireHorizonWithinRemaining(
      errors,
      'horizonMonths',
      horizonMonths,
      Number.parseInt(draft.currentMortgage.remainingMonths, 10),
      'El horizonte no puede superar el plazo restante de la hipoteca actual.'
    );
    requireHorizonWithinRemaining(
      errors,
      'horizonMonths',
      horizonMonths,
      Number.parseInt(draft.alternativeOffer.withoutBonus.remainingMonths, 10),
      'El horizonte no puede superar el plazo restante de la oferta base.'
    );

    if (draft.alternativeOffer.hasBonusVariant) {
      requireHorizonWithinRemaining(
        errors,
        'horizonMonths',
        horizonMonths,
        Number.parseInt(draft.alternativeOffer.withBonus.remainingMonths, 10),
        'El horizonte no puede superar el plazo restante de la oferta bonificada.'
      );
    }
  }

  const numericSwitchCosts: Array<[keyof DraftSwitchCosts, string]> = [
    ['agency', draft.switchCosts.agency],
    ['notary', draft.switchCosts.notary],
    ['appraisal', draft.switchCosts.appraisal],
    ['management', draft.switchCosts.management],
    ['cancellationFee', draft.switchCosts.cancellationFee],
    ['openingFee', draft.switchCosts.openingFee],
    ['other', draft.switchCosts.other]
  ];

  numericSwitchCosts.forEach(([field, value]) => {
    requireNonNegativeNumber(errors, `switchCosts.${field}`, value, 'Usa 0 o un importe válido.');
  });

  if (toNumber(draft.switchCosts.other) > 0 && draft.switchCosts.otherDescription.trim().length === 0) {
    errors['switchCosts.otherDescription'] = 'Describe qué estás metiendo en otros costes.';
  }

  const hasIncome = draft.householdProfile.netMonthlyIncome.trim().length > 0;
  const hasObligations = draft.householdProfile.monthlyObligations.trim().length > 0;

  if (hasIncome) {
    requirePositiveNumber(
      errors,
      'householdProfile.netMonthlyIncome',
      draft.householdProfile.netMonthlyIncome,
      'Los ingresos deben ser mayores que 0 para evaluar asequibilidad.'
    );
  }

  if (hasObligations) {
    requireNonNegativeNumber(
      errors,
      'householdProfile.monthlyObligations',
      draft.householdProfile.monthlyObligations,
      'Las obligaciones no pueden ser negativas.'
    );
  }

  if (hasObligations && !hasIncome) {
    errors['householdProfile.netMonthlyIncome'] =
      'Si quieres medir asequibilidad, no podemos quedarnos sin ingresos netos.';
  }

  if (
    draft.householdProfile.incomeStability === 'variable' &&
    draft.householdProfile.notes.trim().length === 0
  ) {
    errors['householdProfile.notes'] =
      'Si los ingresos son variables, explica el supuesto para que la advertencia sea visible.';
  }

  return errors;
}

function validateMortgage(
  errors: ErrorMap,
  prefix: string,
  fields: DraftMortgageSection,
  currentScenario: boolean
) {
  requirePositiveNumber(errors, `${prefix}.pendingPrincipal`, fields.pendingPrincipal, 'Necesitamos el capital pendiente.');
  requirePositiveInteger(errors, `${prefix}.remainingMonths`, fields.remainingMonths, 'El plazo debe ser un entero positivo.');
  requireNonNegativeNumber(errors, `${prefix}.nominalAnnualRate`, fields.nominalAnnualRate, 'El tipo no puede ser negativo.');
  requireNonNegativeNumber(errors, `${prefix}.recurringCostsMonthly`, fields.recurringCostsMonthly, 'Usa 0 o un importe mensual válido.');

  if (currentScenario && fields.currentInstallment.trim().length > 0) {
    requirePositiveNumber(errors, `${prefix}.currentInstallment`, fields.currentInstallment, 'Si informas la cuota, que sea mayor que 0.');
  }
}

function validateOffer(
  errors: ErrorMap,
  prefix: string,
  fields: DraftOfferSection,
  bonusScenario: boolean
) {
  requirePositiveNumber(errors, `${prefix}.pendingPrincipal`, fields.pendingPrincipal, 'Necesitamos el capital pendiente.');
  requirePositiveInteger(errors, `${prefix}.remainingMonths`, fields.remainingMonths, 'El plazo debe ser un entero positivo.');
  requireNonNegativeNumber(errors, `${prefix}.nominalAnnualRate`, fields.nominalAnnualRate, 'El tipo no puede ser negativo.');
  requireNonNegativeNumber(errors, `${prefix}.recurringCostsMonthly`, fields.recurringCostsMonthly, 'Usa 0 o un importe mensual válido.');

  if (bonusScenario) {
    requireNonNegativeNumber(
      errors,
      `${prefix}.linkedProductsMonthlyCost`,
      fields.linkedProductsMonthlyCost,
      'Usa 0 o un coste mensual válido.'
    );
    requireNonNegativeNumber(
      errors,
      `${prefix}.bonificationRateDelta`,
      fields.bonificationRateDelta,
      'Usa 0 o una rebaja de tipo válida.'
    );
  }
}

function validateDistinctBonusVariant(errors: ErrorMap, draft: AnalysisDraft) {
  const withoutBonus = draft.alternativeOffer.withoutBonus;
  const withBonus = draft.alternativeOffer.withBonus;

  const hasDifferentRate = toNumber(withBonus.nominalAnnualRate) !== toNumber(withoutBonus.nominalAnnualRate);
  const hasDifferentRecurring =
    toNumber(withBonus.recurringCostsMonthly) !== toNumber(withoutBonus.recurringCostsMonthly);
  const hasLinkedProducts = toNumber(withBonus.linkedProductsMonthlyCost) > 0;
  const hasBonificationDelta = toNumber(withBonus.bonificationRateDelta) > 0;

  if (hasDifferentRate || hasDifferentRecurring || hasLinkedProducts || hasBonificationDelta) {
    return;
  }

  errors['alternativeOffer.withBonus'] =
    'La variante bonificada tiene que cambiar tipo o costes frente a la oferta base. Si no cambia nada, apágala y compara solo dos escenarios.';
}

function requirePositiveNumber(
  errors: ErrorMap,
  key: string,
  value: string,
  message: string
) {
  const numericValue = toNumber(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    errors[key] = message;
  }
}

function requireNonNegativeNumber(
  errors: ErrorMap,
  key: string,
  value: string,
  message: string
) {
  const numericValue = toNumber(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    errors[key] = message;
  }
}

function requirePositiveInteger(
  errors: ErrorMap,
  key: string,
  value: string,
  message: string
) {
  const numericValue = Number.parseInt(value, 10);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    errors[key] = message;
  }
}

function requireHorizonWithinRemaining(
  errors: ErrorMap,
  key: string,
  horizonMonths: number,
  remainingMonths: number,
  message: string
) {
  if (!Number.isInteger(remainingMonths) || remainingMonths <= 0) {
    return;
  }

  if (horizonMonths > remainingMonths) {
    errors[key] = message;
  }
}

export function toRequest(draft: AnalysisDraft): CreateAnalysisRequest {
  const request: CreateAnalysisRequest = {
    retentionPreference: draft.retentionPreference as RetentionPreference,
    horizonMonths: Number.parseInt(draft.horizonMonths, 10),
    currentMortgage: {
      pendingPrincipal: money(draft.currentMortgage.pendingPrincipal),
      remainingMonths: Number.parseInt(draft.currentMortgage.remainingMonths, 10),
      nominalAnnualRate: decimal(draft.currentMortgage.nominalAnnualRate),
      currentInstallment: optionalMoney(draft.currentMortgage.currentInstallment),
      recurringCosts: recurringCostsFromField(
        draft.currentMortgage.recurringCostsMonthly,
        'Costes mensuales de la hipoteca actual'
      )
    },
    alternativeOffer: {
      withoutBonus: {
        pendingPrincipal: money(draft.alternativeOffer.withoutBonus.pendingPrincipal),
        remainingMonths: Number.parseInt(draft.alternativeOffer.withoutBonus.remainingMonths, 10),
        nominalAnnualRate: decimal(draft.alternativeOffer.withoutBonus.nominalAnnualRate),
        recurringCosts: recurringCostsFromField(
          draft.alternativeOffer.withoutBonus.recurringCostsMonthly,
          'Costes mensuales de la oferta sin bonificaciones'
        )
      }
    },
    switchCosts: switchCostsFromDraft(draft.switchCosts)
  };

  if (draft.alternativeOffer.hasBonusVariant) {
    request.alternativeOffer.withBonus = {
      pendingPrincipal: money(draft.alternativeOffer.withBonus.pendingPrincipal),
      remainingMonths: Number.parseInt(draft.alternativeOffer.withBonus.remainingMonths, 10),
      nominalAnnualRate: decimal(draft.alternativeOffer.withBonus.nominalAnnualRate),
      linkedProductsMonthlyCost: money(draft.alternativeOffer.withBonus.linkedProductsMonthlyCost),
      bonificationRateDelta: decimal(draft.alternativeOffer.withBonus.bonificationRateDelta),
      recurringCosts: recurringCostsFromField(
        draft.alternativeOffer.withBonus.recurringCostsMonthly,
        'Costes mensuales adicionales de la oferta bonificada'
      )
    };
  }

  const householdProfile = buildHouseholdProfile(draft);
  if (householdProfile) {
    request.householdProfile = householdProfile;
  }

  return request;
}

function buildHouseholdProfile(draft: AnalysisDraft): CreateAnalysisRequest['householdProfile'] {
  const hasIncome = draft.householdProfile.netMonthlyIncome.trim().length > 0;
  const hasObligations = draft.householdProfile.monthlyObligations.trim().length > 0;
  const hasNotes = draft.householdProfile.notes.trim().length > 0;

  if (!hasIncome && !hasObligations && !hasNotes) {
    return undefined;
  }

  return {
    netMonthlyIncome: money(draft.householdProfile.netMonthlyIncome || '0'),
    monthlyObligations: money(draft.householdProfile.monthlyObligations || '0'),
    incomeStability: draft.householdProfile.incomeStability,
    notes: draft.householdProfile.notes.trim() || undefined
  };
}

function switchCostsFromDraft(switchCosts: DraftSwitchCosts) {
  const baseCosts = [
    buildCost('agency', 'one_off_switch', switchCosts.agency, 'Agencia'),
    buildCost('notary', 'one_off_switch', switchCosts.notary, 'Notaría'),
    buildCost('appraisal', 'one_off_switch', switchCosts.appraisal, 'Tasación'),
    buildCost('management', 'one_off_switch', switchCosts.management, 'Gestoría'),
    buildCost(
      'cancellation_fee',
      'one_off_switch',
      switchCosts.cancellationFee,
      'Cancelación o comisión'
    ),
    buildCost('opening_fee', 'one_off_switch', switchCosts.openingFee, 'Apertura'),
    buildCost(
      'other',
      'one_off_switch',
      switchCosts.other,
      switchCosts.otherDescription || 'Otros costes'
    )
  ];

  return baseCosts.filter(Boolean) as NonNullable<CreateAnalysisRequest['switchCosts']>;
}

function recurringCostsFromField(
  amount: string,
  description: string
): CreateAnalysisRequest['currentMortgage']['recurringCosts'] {
  const numericAmount = toNumber(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return [];
  }

  return [
    {
      amount: money(amount),
      costType: 'other' as const,
      description,
      sourceType: 'user_provided' as const,
      timing: 'monthly' as const
    }
  ];
}

function buildCost(
  costType:
    | 'agency'
    | 'notary'
    | 'appraisal'
    | 'management'
    | 'cancellation_fee'
    | 'opening_fee'
    | 'other',
  timing: 'one_off_switch',
  amount: string,
  description: string
) {
  const numericAmount = toNumber(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return null;
  }

  return {
    amount: money(amount),
    costType,
    description,
    sourceType: 'user_provided' as const,
    timing
  };
}

function money(value: string) {
  return toNumber(value).toFixed(2);
}

function decimal(value: string) {
  return toNumber(value).toFixed(2);
}

function optionalMoney(value: string) {
  return value.trim().length > 0 ? money(value) : undefined;
}

function toNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}
