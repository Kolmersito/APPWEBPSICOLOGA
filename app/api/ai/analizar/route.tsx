import { NextRequest, NextResponse } from 'next/server'
import { geminiModel } from '@/lib/gemini/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { session_note_id, observaciones, sintomas, avances, temas } = await request.json()

    if (!observaciones && !sintomas && !temas) {
      return NextResponse.json({ error: 'No hay contenido para analizar' }, { status: 400 })
    }

    const prompt = `Eres un asistente clínico de apoyo para una psicóloga. Analiza las siguientes notas de sesión y genera sugerencias clínicas útiles.

NOTAS DE SESIÓN:
${observaciones ? `Observaciones generales:\n${observaciones.replace(/<[^>]*>/g, '')}\n` : ''}
${sintomas ? `Síntomas detectados:\n${sintomas.replace(/<[^>]*>/g, '')}\n` : ''}
${avances ? `Avances observados:\n${avances.replace(/<[^>]*>/g, '')}\n` : ''}
${temas ? `Temas tratados:\n${temas.replace(/<[^>]*>/g, '')}\n` : ''}

Genera entre 2 y 4 sugerencias clínicas en formato JSON. Cada sugerencia debe tener:
- "sugerencia": texto breve y útil (máximo 120 caracteres)
- "tipo": uno de estos valores exactos: "alerta", "sugerencia", "punto_omitido"

Usa "alerta" para señales de riesgo o patrones preocupantes.
Usa "sugerencia" para técnicas o enfoques que podrían aplicarse.
Usa "punto_omitido" para aspectos clínicos importantes que no se registraron.

Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown, sin backticks. Ejemplo:
[{"sugerencia":"texto aquí","tipo":"sugerencia"}]`

    const result = await geminiModel.generateContent(prompt)
    const text = result.response.text().trim()

    let suggestions: { sugerencia: string; tipo: string }[] = []

    try {
      const clean = text.replace(/```json|```/g, '').trim()
      suggestions = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Error al parsear respuesta de IA' }, { status: 500 })
    }

    if (session_note_id) {
      await supabase.from('ai_suggestions').delete().eq('session_note_id', session_note_id)

      const toInsert = suggestions.map(s => ({
        session_note_id,
        sugerencia: s.sugerencia,
        tipo: s.tipo,
        vista: false,
      }))

      const { data: saved } = await supabase
        .from('ai_suggestions')
        .insert(toInsert)
        .select()

      return NextResponse.json({ suggestions: saved })
    }

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('Error en API IA:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}