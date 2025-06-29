import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface QuizData {
  furnitureType: string;
  condition: string;
  rooms: string[];
  style: string;
  size: string;
  colorVibe: string;
  customColor?: string;
  materials: string[];
  tools: string[];
  budget: number;
  addons: string[];
  recyclables: string[];
  customRecyclables?: string;
  photos: string[];
}

interface GuideStep {
  step_number: number;
  title: string;
  description: string;
  image_url?: string;
  tools_needed: string[];
  materials_needed: string[];
  estimated_time: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { projectId, quizData }: { projectId: string; quizData: QuizData } = await req.json();

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'AI service is not properly configured',
          code: 'MISSING_API_KEY',
          details: 'The Gemini API key is not configured. Please contact support.'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('Generating guide for project:', projectId);
    console.log('Quiz data received:', JSON.stringify(quizData, null, 2));

    const prompt = `Create a detailed DIY furniture upcycling guide based on the following information:

Furniture Type: ${quizData.furnitureType}
Current Condition: ${quizData.condition}
Target Rooms: ${quizData.rooms?.join(', ') || 'Not specified'}
Desired Style: ${quizData.style}
Size: ${quizData.size}
Color Preference: ${quizData.colorVibe}${quizData.customColor ? ` (Custom: ${quizData.customColor})` : ''}
Available Materials: ${quizData.materials?.join(', ') || 'Not specified'}
Available Tools: ${quizData.tools?.join(', ') || 'Not specified'}
Budget: $${quizData.budget || 'Not specified'}
Additional Features: ${quizData.addons?.join(', ') || 'None'}
Recyclable Materials: ${quizData.recyclables?.join(', ') || 'None'}${quizData.customRecyclables ? ` (Custom: ${quizData.customRecyclables})` : ''}

Please create a comprehensive step-by-step guide with the following requirements:
1. Each step should have a clear title and detailed description (2-3 sentences minimum)
2. List specific tools and materials needed for each step
3. Provide realistic time estimates for each step
4. Include safety tips where relevant
5. Make it beginner-friendly but thorough
6. Create 4-8 logical steps that flow naturally
7. Consider the user's available tools and budget constraints
8. Incorporate any recyclable materials creatively
9. Match the desired style and color preferences

Return the response as a valid JSON object with this exact structure:
{
  "title": "Descriptive Project Title",
  "overview": "Brief 2-3 sentence project overview explaining the transformation",
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimated_time": "Total time estimate (e.g., '2-3 days', '4-6 hours')",
  "environmental_score": 85,
  "materials_list": ["material1", "material2", "material3"],
  "steps": [
    {
      "step_number": 1,
      "title": "Step Title",
      "description": "Detailed step description with safety tips and specific instructions",
      "tools_needed": ["tool1", "tool2"],
      "materials_needed": ["material1", "material2"],
      "estimated_time": "30 minutes"
    }
  ]
}

Important: Return ONLY the JSON object, no additional text or formatting.`;

    console.log('Calling Gemini API with prompt length:', prompt.length);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
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
      }),
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      
      let errorCode = 'EXTERNAL_API_ERROR';
      let userMessage = 'AI service is temporarily unavailable';
      
      if (response.status === 401) {
        errorCode = 'INVALID_API_KEY';
        userMessage = 'AI service authentication failed';
      } else if (response.status === 429) {
        errorCode = 'RATE_LIMIT_EXCEEDED';
        userMessage = 'Too many requests, please try again later';
      }
      
      return new Response(
        JSON.stringify({ 
          error: userMessage,
          code: errorCode,
          details: `Gemini API returned ${response.status}: ${response.statusText}`
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response from AI service');
    }

    const guideContent = data.candidates[0].content.parts[0].text;
    console.log('Generated guide content length:', guideContent.length);

    let guideData;
    try {
      // Clean the response - remove any markdown formatting or extra text
      const cleanedContent = guideContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      guideData = JSON.parse(cleanedContent);
      console.log('Successfully parsed guide JSON');
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Raw content:', guideContent);
      
      // Fallback guide data
      guideData = {
        title: `${quizData.furnitureType} Upcycling Project`,
        overview: `Transform your ${quizData.furnitureType} with a ${quizData.style} style makeover that fits perfectly in your ${quizData.rooms?.[0] || 'space'}.`,
        difficulty: 'Intermediate',
        estimated_time: '2-3 days',
        environmental_score: 85,
        materials_list: [
          'Sandpaper (120 & 220 grit)',
          'Primer',
          'Paint or stain',
          'Brushes and rollers',
          'Protective finish'
        ],
        steps: [
          {
            step_number: 1,
            title: 'Preparation and Cleaning',
            description: 'Remove all hardware and clean the furniture thoroughly. Sand any rough areas and wipe down with a damp cloth to ensure proper paint adhesion.',
            tools_needed: quizData.tools?.slice(0, 3) || ['Screwdriver', 'Sandpaper', 'Cleaning cloth'],
            materials_needed: ['Wood cleaner', 'Sandpaper', 'Tack cloth'],
            estimated_time: '2 hours'
          },
          {
            step_number: 2,
            title: 'Surface Preparation',
            description: 'Apply primer to ensure even coverage and better paint adhesion. Allow to dry completely according to manufacturer instructions.',
            tools_needed: ['Paint brushes', 'Roller', 'Paint tray'],
            materials_needed: ['Primer', 'Drop cloths'],
            estimated_time: '3 hours'
          },
          {
            step_number: 3,
            title: 'Main Finish Application',
            description: 'Apply your chosen paint or stain in thin, even coats. Work in the direction of the wood grain and maintain a wet edge to avoid lap marks.',
            tools_needed: ['Paint brushes', 'Roller', 'Paint tray'],
            materials_needed: ['Paint or stain', 'Stirring stick'],
            estimated_time: '4 hours'
          },
          {
            step_number: 4,
            title: 'Final Details and Protection',
            description: 'Install new hardware if desired and apply a protective topcoat. Allow to cure completely before use.',
            tools_needed: ['Drill', 'Screwdriver', 'Fine brush'],
            materials_needed: ['Hardware', 'Protective finish', 'Screws'],
            estimated_time: '2 hours'
          }
        ]
      };
    }

    // Validate the guide data structure
    if (!guideData.title || !guideData.steps || !Array.isArray(guideData.steps)) {
      console.error('Invalid guide data structure:', guideData);
      throw new Error('Generated guide has invalid structure');
    }

    console.log('Guide validation successful, updating database...');

    // Update the project with the generated guide
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update project with guide data
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        guide_json: guideData,
        style: guideData.difficulty || quizData.style,
        difficulty: guideData.difficulty,
        estimated_time: guideData.estimated_time,
        environmental_score: guideData.environmental_score
      })
      .eq('id', projectId);

    if (projectError) {
      console.error('Database error updating project:', projectError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save guide',
          code: 'DATABASE_ERROR',
          details: projectError.message
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Insert steps into the steps table
    const stepsToInsert = guideData.steps.map((step: any) => ({
      project_id: projectId,
      step_number: step.step_number,
      title: step.title,
      description: step.description,
      tools_needed: step.tools_needed || [],
      materials_needed: step.materials_needed || [],
      estimated_time: step.estimated_time || '30 minutes'
    }));

    const { error: stepsError } = await supabase
      .from('steps')
      .insert(stepsToInsert);

    if (stepsError) {
      console.error('Database error inserting steps:', stepsError);
      // Don't fail the entire request if steps insertion fails
      console.log('Continuing despite steps insertion error...');
    }

    console.log('Guide generation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        guide: guideData,
        message: 'Guide generated successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error generating guide:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate guide',
        code: 'INTERNAL_ERROR',
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});