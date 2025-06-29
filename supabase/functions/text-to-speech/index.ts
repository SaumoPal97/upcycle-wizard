import { corsHeaders } from '../_shared/cors.ts'

interface TextToSpeechRequest {
  text: string
  voice_id?: string
  model_id?: string
  voice_settings?: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  console.log('🎤 Starting text-to-speech request')

  try {
    const { text, voice_id, model_id, voice_settings }: TextToSpeechRequest = await req.json()

    if (!text || text.trim().length === 0) {
      console.error('❌ Missing or empty text parameter')
      return new Response(
        JSON.stringify({ 
          error: 'Text parameter is required and cannot be empty',
          code: 'MISSING_TEXT'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if ElevenLabs API key is configured
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      console.error('🔑 ELEVENLABS_API_KEY environment variable is not configured')
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your environment variables.',
          code: 'MISSING_API_KEY'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('🔑 ElevenLabs API key validation passed')
    console.log('📝 Text to convert:', text.substring(0, 100) + (text.length > 100 ? '...' : ''))

    // Default voice settings optimized for assistant responses
    const defaultVoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    }

    // Use a pleasant, clear voice by default (Rachel voice ID)
    const defaultVoiceId = 'pNInz6obpgDQGcFmaJgB' // Rachel - clear, professional female voice
    
    const requestBody = {
      text: text.trim(),
      model_id: model_id || 'eleven_multilingual_v2',
      voice_settings: { ...defaultVoiceSettings, ...voice_settings }
    }

    console.log('📡 Making request to ElevenLabs API')
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id || defaultVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify(requestBody),
      }
    )

    console.log('📡 ElevenLabs API response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type')
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ ElevenLabs API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      let errorMessage = 'ElevenLabs API error'
      let errorCode = 'EXTERNAL_API_ERROR'
      
      if (response.status === 401) {
        errorMessage = 'Invalid ElevenLabs API key'
        errorCode = 'INVALID_API_KEY'
      } else if (response.status === 429) {
        errorMessage = 'ElevenLabs API rate limit exceeded'
        errorCode = 'RATE_LIMIT_EXCEEDED'
      } else if (response.status === 422) {
        errorMessage = 'Invalid request parameters for ElevenLabs API'
        errorCode = 'INVALID_PARAMETERS'
      } else if (response.status >= 500) {
        errorMessage = 'ElevenLabs service temporarily unavailable'
        errorCode = 'SERVICE_UNAVAILABLE'
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          code: errorCode,
          details: errorText
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status >= 500 ? 502 : response.status,
        }
      )
    }

    // Get the audio data as array buffer
    const audioBuffer = await response.arrayBuffer()
    const audioSize = audioBuffer.byteLength
    
    const totalTime = Date.now() - startTime
    console.log('✅ Text-to-speech conversion completed:', {
      textLength: text.length,
      audioSize: `${(audioSize / 1024).toFixed(2)} KB`,
      processingTime: `${totalTime}ms`
    })

    // Return the audio data with appropriate headers
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioSize.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
      status: 200,
    })

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('💥 Error in text-to-speech function:', {
      error: error.message,
      stack: error.stack,
      processingTime: `${totalTime}ms`
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error during text-to-speech conversion',
        code: 'INTERNAL_ERROR',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})