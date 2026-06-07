import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Límites para regular el consumo de tokens (entrada)
// ~4 caracteres ≈ 1 token, así que estos topes acotan el coste de cada llamada.
const MAX_PROMPT_CHARS = 24000   // informes (prompt_override): ~6k tokens de entrada
const MAX_FIELD_CHARS = 4000     // cada campo de notas en el análisis de sesión

// Recorta un texto al límite de caracteres indicado.
function limit(text: string | undefined | null, max: number): string {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) : text
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const { session_note_id, observaciones, sintomas, avances, temas, prompt_override } = body

    // Para informes
    if (prompt_override) {
      if (typeof prompt_override !== 'string') {
        return NextResponse.json({ error: 'prompt_override inválido' }, { status: 400 })
      }
      if (prompt_override.length > MAX_PROMPT_CHARS) {
        return NextResponse.json(
          { error: `El contenido es demasiado largo (${prompt_override.length} caracteres, máximo ${MAX_PROMPT_CHARS}). Reduce el número de sesiones incluidas.` },
          { status: 413 }
        )
      }
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt_override }],
      })
      console.log('[IA/informe] tokens:', message.usage)
      const texto = (message.content[0] as any).text
      return NextResponse.json({ texto })
    }

    if (!observaciones && !sintomas && !temas) {
      return NextResponse.json({ error: 'No hay contenido para analizar' }, { status: 400 })
    }

    const prompt = `Eres un asistente clínico de apoyo para una psicóloga. Analiza estas notas de sesión de forma breve y directa.

NOTAS:
${observaciones ? `Observaciones: ${limit(observaciones.replace(/<[^>]*>/g, ''), MAX_FIELD_CHARS)}\n` : ''}
${sintomas ? `Síntomas: ${limit(sintomas.replace(/<[^>]*>/g, ''), MAX_FIELD_CHARS)}\n` : ''}
${avances ? `Avances: ${limit(avances.replace(/<[^>]*>/g, ''), MAX_FIELD_CHARS)}\n` : ''}
${temas ? `Temas: ${limit(temas.replace(/<[^>]*>/g, ''), MAX_FIELD_CHARS)}\n` : ''}

Genera máximo 3 observaciones clínicas breves. Enfócate en:
- Posibles déficits o patrones no abordados
- Señales de alerta que podrían indicar un trastorno
- Aspectos clínicos que la psicóloga pudo haber pasado por alto

Responde SOLO con un array JSON sin markdown ni texto extra:
[{"sugerencia":"texto máximo 150 caracteres","tipo":"alerta|sugerencia|punto_omitido"}]`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    console.log('[IA/análisis] tokens:', message.usage)
    const text = (message.content[0] as any).text.trim()
    let suggestions = []

    try {
      const clean = text.replace(/```json|```/g, '').trim()
      suggestions = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Error al parsear respuesta' }, { status: 500 })
    }

    if (session_note_id) {
      await supabase.from('ai_suggestions').delete().eq('session_note_id', session_note_id)
      const { data: saved } = await supabase.from('ai_suggestions')
        .insert(suggestions.map((s: any) => ({
          session_note_id, sugerencia: s.sugerencia, tipo: s.tipo, vista: false,
        }))).select()
      return NextResponse.json({ suggestions: saved })
    }

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('Error en API IA:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}