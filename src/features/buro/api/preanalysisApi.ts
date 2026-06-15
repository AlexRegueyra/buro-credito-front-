import axios, { isAxiosError } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

const DECISION_API_BASE =
  (import.meta.env['VITE_DECISION_API_URL'] as string | undefined) ?? 'http://localhost:8086';

const decisionClient = axios.create({
  baseURL: DECISION_API_BASE,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreanalisisResponse {
  consultaId?: number;
  // Campos normalizados (los usa el componente)
  decision?: string;
  nivelRiesgo?: string;
  score?: number;
  alertas?: string[];
  reasons?: string[];
  rulesFired?: string[];
  partialFacts?: Record<string, unknown>;
  message?: string;
  // Campos crudos del backend (mapeados en ejecutarPreanalisis)
  outcome?: string;
  riskLevel?: string;
  alerts?: string[];
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function ejecutarPreanalisis(consultaId: number): Promise<PreanalisisResponse> {
  const { data } = await decisionClient.post<PreanalisisResponse>(
    `/api/decisions/buro/preanalysis/${String(consultaId)}`,
  );
  // Normalizar nombres de campo: el backend envía outcome/riskLevel/alerts
  const normalized: PreanalisisResponse = { ...data };
  const decision    = data.decision    ?? data.outcome;
  const nivelRiesgo = data.nivelRiesgo ?? data.riskLevel;
  if (decision    !== undefined) normalized.decision    = decision;
  if (nivelRiesgo !== undefined) normalized.nivelRiesgo = nivelRiesgo;
  normalized.alertas = data.alertas ?? data.alerts ?? [];
  return normalized;
}

export async function fetchFacts(consultaId: number): Promise<Record<string, unknown>> {
  const { data } = await decisionClient.get<Record<string, unknown>>(
    `/api/decisions/buro/preanalysis/${String(consultaId)}/facts`,
  );
  return data;
}

// ─── Error classifier ─────────────────────────────────────────────────────────

export function classifyPreanalisisError(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Error inesperado al ejecutar el preanálisis.';
  }
  const status = error.response?.status;
  if (status === 404) return 'Consulta no encontrada. Verifica que el ID exista en buro-credito.';
  if (status === 503 || status === 502 || status === undefined) {
    return 'Servicio no disponible. Verifica que buro-adapter y decision-runtime estén corriendo.';
  }
  if (status === 500) {
    const responseData = error.response?.data as { message?: string } | undefined;
    return responseData?.message
      ? `Error interno: ${responseData.message}`
      : 'Error interno en el motor de decisiones.';
  }
  const responseData = error.response?.data as { message?: string } | undefined;
  return responseData?.message ?? `Error ${String(status)} al conectar con buro-adapter.`;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useEjecutarPreanalisis() {
  return useMutation({
    mutationFn: ejecutarPreanalisis,
  });
}

export function useFacts(consultaId: number | null) {
  return useQuery({
    queryKey: ['buro-preanalysis-facts', consultaId],
    queryFn: () => {
      if (consultaId === null) throw new Error('consultaId is null');
      return fetchFacts(consultaId);
    },
    enabled: consultaId !== null,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
