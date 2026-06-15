import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { ConsultaRequest, ApiResponseModel } from '../types';

// En local apunta directo al Spring Boot; en producción usa el BFF (/x-api)
const IS_MOCK = import.meta.env['VITE_AUTH_MOCK'] === 'true';
const API_BASE = IS_MOCK
  ? (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:8083'
  : (() => {
      const project = import.meta.env['VITE_NAME_PROJECT'] as string | undefined;
      return project ? `/${project}/x-api` : '/x-api';
    })();

const buroClient = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
  withCredentials: !IS_MOCK,
  headers: { 'Content-Type': 'application/json' },
});

export async function consultarReportePM(body: ConsultaRequest): Promise<ApiResponseModel> {
  const { data } = await buroClient.post<ApiResponseModel>('/buro/reporte-de-credito-PM', body);
  return data;
}

export async function consultarInformeBuro(body: ConsultaRequest): Promise<ApiResponseModel> {
  const { data } = await buroClient.post<ApiResponseModel>('/buro/informe-buro-PM', body);
  return data;
}

export async function consultarPerfilador(body: ConsultaRequest): Promise<ApiResponseModel> {
  const { data } = await buroClient.post<ApiResponseModel>('/buro/perfilador-PM', body);
  return data;
}

// ─── Catálogos ────────────────────────────────────────────────────────────────

export interface EstadoCatalogo {
  codigo: string;
  nombre: string;
}

export interface PaisCatalogo {
  id: number;
  codigo: string;
  pais: string;
}

export async function fetchEstados(): Promise<EstadoCatalogo[]> {
  const { data } = await buroClient.get<EstadoCatalogo[]>('/api/catalogos/pm/codigoEstado');
  return data;
}

export async function fetchPaises(): Promise<PaisCatalogo[]> {
  const { data } = await buroClient.get<PaisCatalogo[]>('/api/catalogos/pm/pais');
  return data;
}

export function useEstados() {
  return useQuery({
    queryKey: ['buro-estados'],
    queryFn: fetchEstados,
    staleTime: 30 * 60 * 1000,
  });
}

export function usePaises() {
  return useQuery({
    queryKey: ['buro-paises'],
    queryFn: fetchPaises,
    staleTime: 30 * 60 * 1000,
  });
}

// ─── Historial ────────────────────────────────────────────────────────────────

export interface ConsultaResumen {
  id: number;
  rfc: string | null;
  tipoConsulta: string;
  fechaConsulta: string;
}

export interface ConsultaDetalle extends ConsultaResumen {
  respuesta: ApiResponseModel;
}

export async function fetchHistorial(rfc?: string): Promise<ConsultaResumen[]> {
  const { data } = await buroClient.get<ConsultaResumen[]>('/buro/historial', {
    params: rfc ? { rfc } : {},
  });
  return data;
}

export async function fetchHistorialDetalle(id: number): Promise<ConsultaDetalle> {
  const { data } = await buroClient.get<ConsultaDetalle>(`/buro/historial/${id}`);
  return data;
}

export function useHistorial(rfc?: string) {
  return useQuery({
    queryKey: ['buro-historial', rfc ?? ''],
    queryFn: () => fetchHistorial(rfc),
    staleTime: 60_000,
  });
}

export function useHistorialDetalle(id: number | null) {
  return useQuery({
    queryKey: ['buro-historial-detalle', id],
    queryFn: () => fetchHistorialDetalle(id!),
    enabled: id !== null,
    staleTime: 5 * 60_000,
  });
}

// ─── PFAE functions ───────────────────────────────────────────────────────────
// Preparadas pero solo accesibles cuando VITE_PFAE_ENABLED=true o VITE_PFAE_MOCK_ENABLED=true.

export async function consultarReportePFAE(body: ConsultaRequest): Promise<ApiResponseModel> {
  const { data } = await buroClient.post<ApiResponseModel>('/buro/reporte-de-credito-PFAE', body);
  return data;
}

export async function consultarInformeBuroPFAE(body: ConsultaRequest): Promise<ApiResponseModel> {
  const { data } = await buroClient.post<ApiResponseModel>('/buro/informe-buro-PFAE', body);
  return data;
}

export async function consultarPerfiladorPFAE(body: ConsultaRequest): Promise<ApiResponseModel> {
  const { data } = await buroClient.post<ApiResponseModel>('/buro/perfilador-PFAE', body);
  return data;
}

// ─── Mock PFAE — solo activo cuando VITE_PFAE_MOCK_ENABLED=true ───────────────
const PFAE_MOCK_ENABLED = import.meta.env['VITE_PFAE_MOCK_ENABLED'] === 'true';
const PFAE_MOCK_RESPONSE: ApiResponseModel = {
  encabezado: { claveRetorno: 'MOCK-PFAE', identificadorTransaccion: 'MOCK-0000' },
} as ApiResponseModel;

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useConsultarReportePM() {
  return useMutation({
    mutationFn: consultarReportePM,
  });
}

export function useConsultarInformeBuro() {
  return useMutation({
    mutationFn: consultarInformeBuro,
  });
}

export function useConsultarPerfilador() {
  return useMutation({
    mutationFn: consultarPerfilador,
  });
}

export function useConsultarReportePFAE() {
  return useMutation({
    mutationFn: PFAE_MOCK_ENABLED
      ? async (_body: ConsultaRequest) => ({ ...PFAE_MOCK_RESPONSE })
      : consultarReportePFAE,
  });
}

export function useConsultarInformeBuroPFAE() {
  return useMutation({
    mutationFn: PFAE_MOCK_ENABLED
      ? async (_body: ConsultaRequest) => ({ ...PFAE_MOCK_RESPONSE })
      : consultarInformeBuroPFAE,
  });
}

export function useConsultarPerfiladorPFAE() {
  return useMutation({
    mutationFn: PFAE_MOCK_ENABLED
      ? async (_body: ConsultaRequest) => ({ ...PFAE_MOCK_RESPONSE })
      : consultarPerfiladorPFAE,
  });
}
