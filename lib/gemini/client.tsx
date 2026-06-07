// ARCHIVO OBSOLETO - LA MIGRACIÓN A CLAUDE HA SIDO COMPLETADA
// Este archivo ya no se está usando. El análisis de IA ahora se hace através de /api/ai/analizar
// utilizando Anthropic Claude en lugar de Google Gemini.
// 
// Para remover completamente, ejecuta:
// rm lib/gemini/client.tsx
// rmdir lib/gemini/

// import { GoogleGenerativeAI } from '@google/generative-ai'
// 
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
// 
// export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })