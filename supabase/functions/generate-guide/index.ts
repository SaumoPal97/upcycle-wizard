import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface QuizData {
  furnitureType: string;
  condition: string;
  room: string;
  style: string;
  size: string;
  color: string;
  materials: string[];
  tools: string[];
  budget: number;
  addons: string[];
  recyclables: string[];
  photoUrl?: string;
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
    const { quizData }: { quizData: QuizData } = await req.json();

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Create a detailed DIY furniture upcycling guide based on the following information:

Furniture Type: ${quizData.furnitureType}
Current Condition: ${quizData.condition}
Target Room: ${quizData.room}
Desired Style: ${quizData.style}
Size: ${quizData.size}
Color Preference: ${quizData.color}
Available Materials: ${quizData.materials.join(', ')}
Available Tools: ${quizData.tools.join(', ')}
Budget: $${quizData.budget}
Additional Features: ${quizData.addons.join(', ')}
Recyclable Materials: ${quizData.recyclables.join(', ')}

Please create a comprehensive step-by-step guide with the following structure:
1. Each step should have a clear title and detailed description
2. List specific tools and materials needed for each step
3. Provide realistic time estimates
4. Include safety tips where relevant
5. Make it beginner-friendly but thorough

Return the response as a JSON object with this structure:
{
  "title": "Project Title",
  "description": "Brief project overview",
  "difficulty": "Beginner/Intermediate/Advanced",
  "estimated_time": "Total time estimate",
  "environmental_score": 85,
  "steps": [
    {
      "step_number": 1,
      "title": "Step Title",
      "description": "Detailed step description with safety tips",
      "tools_needed": ["tool1", "tool2"],
      "materials_needed": ["material1", "material2"],
      "estimated_time": "30 minutes"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert DIY furniture upcycling consultant. Create detailed, safe, and environmentally conscious guides.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const guideContent = data.choices[0].message.content;

    let guideData;
    try {
      guideData = JSON.parse(guideContent);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      guideData = {
        title: `${quizData.furnitureType} Upcycling Project`,
        description: 'A custom upcycling guide generated based on your preferences.',
        difficulty: 'Intermediate',
        estimated_time: '4-6 hours',
        environmental_score: 85,
        steps: [
          {
            step_number: 1,
            title: 'Preparation and Planning',
            description: 'Gather all materials and tools. Clean the furniture piece thoroughly and assess its condition.',
            tools_needed: quizData.tools.slice(0, 3),
            materials_needed: quizData.materials.slice(0, 3),
            estimated_time: '30 minutes'
          }
        ]
      };
    }

    return new Response(
      JSON.stringify(guideData),
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