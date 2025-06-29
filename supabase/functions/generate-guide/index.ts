import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface QuizData {
  photos: string[]
  furnitureType: string
  size: string
  materials: string[]
  condition: string
  rooms: string[]
  style: string
  colorVibe: string
  customColor?: string
  addons: string[]
  recyclables: string[]
  customRecyclables?: string
  tools: string[]
  budget: number | null
  initialPrompt?: string
}

interface GuideStep {
  title: string
  description: string
  tools_needed: string[]
  materials_needed: string[]
  estimated_time?: string
  image_prompt?: string
}

interface GuideData {
  title: string
  overview: string
  steps: GuideStep[]
  materials_list: string[]
  recyclables_used: string[]
  estimated_time: string
  difficulty: string
  environmental_score: number
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 30000, // 30 seconds
}

// Sleep utility for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Calculate exponential backoff delay
const calculateDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt)
  return Math.min(delay, RETRY_CONFIG.maxDelay)
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  console.log('🚀 Starting guide generation request')

  try {
    const { projectId, quizData }: { projectId: string; quizData: QuizData } = await req.json()

    if (!projectId || !quizData) {
      console.error('❌ Missing required parameters:', { projectId: !!projectId, quizData: !!quizData })
      throw new Error('Missing required parameters: projectId and quizData are required')
    }

    console.log('📋 Request parameters validated:', {
      projectId,
      furnitureType: quizData.furnitureType,
      style: quizData.style,
      photosCount: quizData.photos?.length || 0
    })

    // Check if Gemini API key is configured
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('🔑 GEMINI_API_KEY environment variable is not configured')
      return new Response(
        JSON.stringify({ 
          error: 'API configuration error. Please configure the GEMINI_API_KEY environment variable in your Supabase Edge Function settings.',
          code: 'MISSING_API_KEY',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('🔑 API key validation passed')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('🗄️ Supabase configuration missing:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      })
      throw new Error('Supabase configuration error')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('🗄️ Supabase client initialized')

    // Generate guide using Google Gemini with retry logic
    console.log('🤖 Starting guide generation with Gemini 2.0 Flash Experimental')
    const guide = await generateGuideWithRetry(quizData, geminiApiKey)
    console.log('✅ Guide generation completed:', {
      title: guide.title,
      stepsCount: guide.steps.length,
      difficulty: guide.difficulty,
      estimatedTime: guide.estimated_time
    })
    
    // Generate images for each step sequentially
    console.log('🖼️ Starting sequential image generation for steps')
    const stepsWithImages = []
    
    for (let index = 0; index < guide.steps.length; index++) {
      const step = guide.steps[index]
      try {
        console.log(`🖼️ Generating image for step ${index + 1}/${guide.steps.length}: ${step.title}`)
        const imageUrl = await generateStepImage(step, quizData, projectId, index, supabase, geminiApiKey)
        console.log(`✅ Image generated for step ${index + 1}:`, imageUrl)
        stepsWithImages.push({ ...step, image_url: imageUrl })
      } catch (error) {
        console.error(`❌ Failed to generate image for step ${index + 1}:`, error.message)
        // Continue without image if generation fails
        stepsWithImages.push(step)
      }
    }

    const finalGuide = { ...guide, steps: stepsWithImages }
    console.log('🖼️ Sequential image generation completed')

    // Update project with generated guide
    console.log('💾 Updating project in database')
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        guide_json: finalGuide,
        style: quizData.style,
        room: quizData.rooms[0] || null,
        difficulty: finalGuide.difficulty,
        estimated_time: finalGuide.estimated_time,
        budget: quizData.budget,
        environmental_score: finalGuide.environmental_score,
        cover_image_url: stepsWithImages[0]?.image_url || null,
      })
      .eq('id', projectId)

    if (updateError) {
      console.error('❌ Failed to update project:', updateError)
      throw new Error(`Database update failed: ${updateError.message}`)
    }

    console.log('✅ Project updated successfully')

    // Insert steps into database
    console.log('💾 Inserting steps into database')
    const stepsData = stepsWithImages.map((step, index) => ({
      project_id: projectId,
      step_number: index + 1,
      title: step.title,
      description: step.description,
      image_url: step.image_url || null,
      tools_needed: step.tools_needed,
      materials_needed: step.materials_needed,
      estimated_time: step.estimated_time || null,
    }))

    const { error: stepsError } = await supabase
      .from('steps')
      .insert(stepsData)

    if (stepsError) {
      console.error('❌ Failed to insert steps:', stepsError)
      throw new Error(`Steps insertion failed: ${stepsError.message}`)
    }

    const totalTime = Date.now() - startTime
    console.log('🎉 Guide generation completed successfully:', {
      totalTime: `${totalTime}ms`,
      projectId,
      stepsCount: stepsData.length
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        guide: finalGuide,
        metadata: {
          processingTime: totalTime,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('💥 Error generating guide:', {
      error: error.message,
      stack: error.stack,
      processingTime: `${totalTime}ms`,
      timestamp: new Date().toISOString()
    })
    
    // Provide more specific error messages
    let errorMessage = error.message
    let errorCode = 'UNKNOWN_ERROR'
    let statusCode = 500
    
    if (error.message.includes('Too Many Requests') || error.message.includes('rate limit')) {
      errorMessage = 'API rate limit exceeded. Please try again in a few minutes.'
      errorCode = 'RATE_LIMIT_EXCEEDED'
      statusCode = 429
    } else if (error.message.includes('API key') || error.message.includes('authentication')) {
      errorMessage = 'Invalid API key configuration. Please check your Gemini API key.'
      errorCode = 'INVALID_API_KEY'
      statusCode = 401
    } else if (error.message.includes('Gemini API error')) {
      errorMessage = 'External AI service error. Please try again later.'
      errorCode = 'EXTERNAL_API_ERROR'
      statusCode = 502
    } else if (error.message.includes('Database') || error.message.includes('Supabase')) {
      errorMessage = 'Database operation failed. Please try again.'
      errorCode = 'DATABASE_ERROR'
      statusCode = 500
    } else if (error.message.includes('JSON')) {
      errorMessage = 'AI response parsing error. Please try again.'
      errorCode = 'PARSING_ERROR'
      statusCode = 500
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: errorCode,
        details: error.message,
        timestamp: new Date().toISOString(),
        processingTime: totalTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    )
  }
})

async function generateGuideWithRetry(quizData: QuizData, geminiApiKey: string): Promise<GuideData> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateDelay(attempt - 1)
        console.log(`⏳ Retry attempt ${attempt}/${RETRY_CONFIG.maxRetries}, waiting ${delay}ms before retry`)
        await sleep(delay)
      }
      
      console.log(`🤖 Attempting Gemini API call (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1})`)
      return await generateGuide(quizData, geminiApiKey)
      
    } catch (error) {
      lastError = error
      console.error(`❌ Attempt ${attempt + 1} failed:`, error.message)
      
      // Don't retry for certain types of errors
      if (error.message.includes('API key') || 
          error.message.includes('authentication') ||
          error.message.includes('Invalid response format') ||
          error.message.includes('Failed to parse')) {
        console.log('🚫 Non-retryable error detected, stopping retries')
        throw error
      }
      
      // Don't retry if this was the last attempt
      if (attempt === RETRY_CONFIG.maxRetries) {
        console.error(`💥 All retry attempts exhausted (${RETRY_CONFIG.maxRetries + 1} total attempts)`)
        break
      }
      
      // Only retry for rate limits and server errors
      if (error.message.includes('Too Many Requests') || 
          error.message.includes('500') || 
          error.message.includes('502') || 
          error.message.includes('503')) {
        console.log('🔄 Retryable error detected, will retry')
        continue
      } else {
        console.log('🚫 Non-retryable error detected, stopping retries')
        throw error
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('All retry attempts failed')
}

async function generateGuide(quizData: QuizData, geminiApiKey: string): Promise<GuideData> {
  const colorPreference = quizData.colorVibe + (quizData.customColor ? ` (Custom: ${quizData.customColor})` : '')
  
  const prompt = `You are a helpful interior design and DIY expert. A user has submitted the following quiz response to upcycle a piece of furniture:

Furniture Type: ${quizData.furnitureType}
Size: ${quizData.size}
Materials: ${quizData.materials.join(', ')}
Condition: ${quizData.condition}
Target Rooms: ${quizData.rooms.join(', ')}
Style: ${quizData.style}
Color Preference: ${colorPreference}
Add-ons: ${quizData.addons.join(', ')}
Recyclables: ${quizData.recyclables.join(', ')}${quizData.customRecyclables ? ` (Custom: ${quizData.customRecyclables})` : ''}
Available Tools: ${quizData.tools.join(', ')}
Budget: $${quizData.budget || 'Not specified'}
${quizData.initialPrompt ? `Initial Idea: ${quizData.initialPrompt}` : ''}

Based on this, create a complete step-by-step upcycling guide. Your response must be valid JSON with the following format:

{
  "title": "Short project title",
  "overview": "2-3 paragraph summary of the project, the creative goal, and what it will become",
  "steps": [
    {
      "title": "Step title",
      "description": "2-5 sentence friendly, clear instructions",
      "tools_needed": ["array", "of", "tools"],
      "materials_needed": ["array", "of", "materials"],
      "estimated_time": "time estimate like '30 minutes'",
      "image_prompt": "1-2 sentence description for AI image generation showing this specific step in action"
    }
  ],
  "materials_list": ["deduplicated", "full", "list"],
  "recyclables_used": ["if any submitted recyclable was reused, describe how"],
  "estimated_time": "total project time",
  "difficulty": "Beginner|Intermediate|Advanced",
  "environmental_score": 4.2
}

Guidelines:
- Be beginner-friendly, warm, and clear
- Reflect user's chosen style, palette, and room
- Stay within the user's tool availability and budget
- Include 5-8 detailed steps
- Calculate environmental score (1-5) based on materials reused and sustainability
- Make the title creative and specific
- For each step, include a concise image_prompt that describes what should be shown in a photo for that step (e.g., "Person sanding the wooden surface of a dresser with 120-grit sandpaper, showing the wood grain being revealed")`

  try {
    console.log('📡 Making request to Gemini 2.0 Flash Experimental API')
    // Updated to use Gemini 2.0 Flash Experimental model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    console.log('📡 Gemini API response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      if (response.status === 429) {
        throw new Error('Too Many Requests - API rate limit exceeded')
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('API key authentication failed')
      } else if (response.status >= 500) {
        throw new Error(`Gemini API server error: ${response.status} ${response.statusText}`)
      } else {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }
    }

    const data = await response.json()
    console.log('📡 Gemini API response parsed successfully')
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Invalid Gemini API response structure:', data)
      throw new Error('Invalid response format from Gemini API - missing candidates or content')
    }
    
    const generatedText = data.candidates[0].content.parts[0].text
    console.log('📝 Generated text length:', generatedText.length)

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('❌ No JSON found in Gemini response:', generatedText.substring(0, 500))
      throw new Error('Failed to extract JSON from Gemini response')
    }

    console.log('🔍 JSON extracted from response, attempting to parse')
    try {
      const parsedGuide = JSON.parse(jsonMatch[0])
      console.log('✅ Guide JSON parsed successfully:', {
        title: parsedGuide.title,
        stepsCount: parsedGuide.steps?.length,
        difficulty: parsedGuide.difficulty
      })
      return parsedGuide
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', {
        error: parseError.message,
        json: jsonMatch[0].substring(0, 500)
      })
      throw new Error(`Failed to parse generated guide JSON: ${parseError.message}`)
    }
  } catch (error) {
    console.error('💥 Error in generateGuide function:', {
      error: error.message,
      stack: error.stack
    })
    throw error
  }
}

async function callImagenAPI(prompt: string, modelId: string, apiKey: string): Promise<Uint8Array> {
  console.log(`🎨 Calling Imagen API with model: ${modelId}`)
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateImage?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: {
        text: prompt
      },
      generationConfig: {
        aspectRatio: "1:1",
        negativePrompt: "blurry, low quality, distorted, text, watermark",
        numberOfImages: 1
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`❌ Imagen API error (${modelId}):`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    })
    
    if (response.status === 429) {
      throw new Error(`Rate limit exceeded for ${modelId}`)
    } else if (response.status === 401 || response.status === 403) {
      throw new Error(`Authentication failed for ${modelId}`)
    } else {
      throw new Error(`Imagen API error for ${modelId}: ${response.status} ${response.statusText}`)
    }
  }

  const data = await response.json()
  
  if (!data.generatedImages || !data.generatedImages[0] || !data.generatedImages[0].bytesBase64Encoded) {
    console.error('❌ Invalid Imagen API response structure:', data)
    throw new Error(`Invalid response format from Imagen API (${modelId})`)
  }

  // Decode base64 to binary data
  const base64Data = data.generatedImages[0].bytesBase64Encoded
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  console.log(`✅ Image generated successfully with ${modelId}, size: ${bytes.length} bytes`)
  return bytes
}

async function generateStepImage(
  step: GuideStep, 
  quizData: QuizData, 
  projectId: string, 
  stepIndex: number, 
  supabase: any, 
  geminiApiKey: string
): Promise<string> {
  if (!step.image_prompt) {
    console.log(`⚠️ No image prompt for step ${stepIndex + 1}, skipping image generation`)
    return getPlaceholderImage(stepIndex)
  }

  // Enhance the image prompt with context
  const enhancedPrompt = `${step.image_prompt}. Style: ${quizData.style}. Furniture type: ${quizData.furnitureType}. High quality, well-lit, professional DIY tutorial photo.`
  
  let imageData: Uint8Array | null = null
  
  try {
    // Try Imagen 4.0 first
    console.log(`🎨 Attempting image generation with Imagen 4.0 for step ${stepIndex + 1}`)
    imageData = await callImagenAPI(enhancedPrompt, 'imagen-4.0-generate-preview-06-06', geminiApiKey)
  } catch (error) {
    console.log(`⚠️ Imagen 4.0 failed for step ${stepIndex + 1}, trying Imagen 3.0:`, error.message)
    
    try {
      // Fallback to Imagen 3.0
      imageData = await callImagenAPI(enhancedPrompt, 'imagen-3.0-generate-002', geminiApiKey)
    } catch (fallbackError) {
      console.error(`❌ Both Imagen models failed for step ${stepIndex + 1}:`, fallbackError.message)
      return getPlaceholderImage(stepIndex)
    }
  }

  if (!imageData) {
    console.error(`❌ No image data generated for step ${stepIndex + 1}`)
    return getPlaceholderImage(stepIndex)
  }

  try {
    // Upload to Supabase Storage
    const fileName = `${projectId}/step-${stepIndex + 1}-${Date.now()}.jpg`
    console.log(`💾 Uploading image to Supabase Storage: ${fileName}`)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('furniture-photos')
      .upload(fileName, imageData, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error(`❌ Failed to upload image for step ${stepIndex + 1}:`, uploadError)
      return getPlaceholderImage(stepIndex)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('furniture-photos')
      .getPublicUrl(uploadData.path)

    console.log(`✅ Image uploaded successfully for step ${stepIndex + 1}:`, publicUrl)
    return publicUrl
    
  } catch (error) {
    console.error(`❌ Error uploading image for step ${stepIndex + 1}:`, error.message)
    return getPlaceholderImage(stepIndex)
  }
}

function getPlaceholderImage(stepIndex: number): string {
  const placeholderImages = [
    'https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg',
    'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
    'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg',
    'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg',
    'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg',
    'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg',
    'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
    'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg',
  ]
  
  return placeholderImages[stepIndex % placeholderImages.length]
}