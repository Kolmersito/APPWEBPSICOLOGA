export type Patient = {
  id: string
  psicologa_id: string
  nombre: string
  apellido: string
  email: string | null
  telefono: string | null
  fecha_nacimiento: string | null
  ocupacion: string | null
  motivo_consulta: string | null
  estado: 'activo' | 'en_pausa' | 'alta'
  created_at: string
}

export type Session = {
  id: string
  patient_id: string
  fecha: string
  tipo: 'presencial' | 'virtual'
  duracion_min: number
  estado: 'pendiente' | 'completada' | 'cancelada'
  google_event_id: string | null
  created_at: string
}

export type SessionNote = {
  id: string
  session_id: string
  observaciones: string | null
  sintomas: string | null
  avances: string | null
  temas_tratados: string | null
  updated_at: string
}

export type AiSuggestion = {
  id: string
  session_note_id: string
  sugerencia: string
  tipo: 'alerta' | 'sugerencia' | 'punto_omitido'
  vista: boolean
  created_at: string
}

export type SupportMaterial = {
  id: string
  psicologa_id: string
  titulo: string
  tipo: 'pdf' | 'imagen' | 'video' | 'enlace'
  url_archivo: string
  categoria: string | null
  created_at: string
}

export type Report = {
  id: string
  patient_id: string
  psicologa_id: string
  titulo: string
  contenido_json: Record<string, unknown>
  estado: 'borrador' | 'finalizado'
  created_at: string
}