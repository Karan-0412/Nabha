// Alternative AI Service with multiple providers
import { config } from '@/config/env';

export interface AIResponse {
  content: string;
  error?: string;
}

export interface SymptomAnalysis {
  possibleConditions: string[];
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  shouldSeeDoctor: boolean;
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine';
}

export interface ImageAnalysis {
  description: string;
  possibleConditions: string[];
  confidence: number;
  recommendations: string[];
}

class AlternativeAIService {
  private apiKey = config.openRouterApiKey;
  private baseUrl = config.openRouterBaseUrl;
  
  // Try different models that are more likely to work
  private models = [
    'meta-llama/llama-3.1-8b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'google/gemma-2-9b-it:free',
    'mistralai/mistral-7b-instruct:free',
    'huggingface/microsoft/DialoGPT-medium',
    'openai/gpt-3.5-turbo'
  ];

  private async makeRequest(messages: any[], modelIndex: number = 0): Promise<AIResponse> {
    if (modelIndex >= this.models.length) {
      throw new Error('All AI models failed');
    }

    const model = this.models[modelIndex];
    console.log(`Trying AI model ${modelIndex + 1}/${this.models.length}: ${model}`);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Nabha Healthcare App',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      console.log(`Response status for ${model}:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error for ${model}:`, errorText);
        
        // Try next model
        return this.makeRequest(messages, modelIndex + 1);
      }

      const data = await response.json();
      console.log(`AI Response received from ${model}:`, data);
      
      return {
        content: data.choices[0]?.message?.content || 'No response generated',
      };
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      // Try next model
      return this.makeRequest(messages, modelIndex + 1);
    }
  }

  async chatResponse(message: string, context: string = '', language: string = 'en'): Promise<string> {
    const systemPrompt = `You are Dr. AI, a medical AI assistant for rural healthcare in India.
    You ONLY respond to medical and health-related questions in ${language}.

    STRICT GUIDELINES:
    - ONLY answer medical, health, and wellness questions
    - If asked about non-medical topics (jokes, weather, general chat), politely redirect to health topics
    - Always recommend consulting a doctor for serious symptoms
    - Be culturally sensitive to rural Indian healthcare needs
    - Provide practical, actionable medical advice
    - Use simple, clear language
    - Never provide specific medical diagnoses
    - Focus on general health guidance and when to seek medical help
    - For emergencies, always recommend immediate medical attention
    - If asked about non-medical topics, say: "I'm Dr. AI, your medical assistant. I can only help with health and medical questions. Please ask me about your health concerns, symptoms, or medical questions."`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${context ? `Context: ${context}\n\n` : ''}User: ${message}` }
    ];

    try {
      const response = await this.makeRequest(messages);
      return response.content;
    } catch (error) {
      console.error('All AI models failed, using fallback:', error);
      return this.getMedicalFallbackResponse(message, language);
    }
  }

  async analyzeSymptoms(symptoms: string, language: string = 'en'): Promise<SymptomAnalysis> {
    const systemPrompt = `You are a medical AI assistant for rural healthcare in India. Analyze the patient's symptoms and provide a structured response in ${language}.

    Respond with a JSON object containing:
    - possibleConditions: array of possible medical conditions
    - severity: "low", "medium", or "high"
    - recommendations: array of immediate care recommendations
    - shouldSeeDoctor: boolean
    - urgency: "immediate", "within_24h", "within_week", or "routine"

    Example JSON response:
    {
      "possibleConditions": ["Common Cold", "Flu"],
      "severity": "medium",
      "recommendations": [
        "Rest and stay hydrated",
        "Monitor temperature",
        "Consult doctor if symptoms worsen"
      ],
      "shouldSeeDoctor": true,
      "urgency": "within_week"
    }`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Patient symptoms: ${symptoms}` }
    ];

    try {
      const response = await this.makeRequest(messages);
      const parsedResponse = JSON.parse(response.content);
      return parsedResponse;
    } catch (error) {
      console.error('Symptom analysis failed, using fallback:', error);
      return this.getFallbackSymptomAnalysis(symptoms, language);
    }
  }

  async analyzeImage(imageData: string, language: string = 'en'): Promise<ImageAnalysis> {
    const systemPrompt = `You are a medical AI assistant for rural healthcare in India. Analyze the provided image and identify potential health issues.
    Provide a structured response in ${language}.

    Respond with a JSON object containing:
    - description: string describing what you see
    - possibleConditions: array of possible conditions
    - confidence: number between 0 and 1
    - recommendations: array of recommendations

    Example JSON response:
    {
      "description": "Skin appears normal with no visible abnormalities",
      "possibleConditions": ["Normal skin", "Minor irritation"],
      "confidence": 0.8,
      "recommendations": [
        "Monitor for changes",
        "Consult dermatologist if concerns persist"
      ]
    }`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this medical image:' },
          { type: 'image_url', image_url: { url: imageData } },
        ],
      },
    ];

    try {
      const response = await this.makeRequest(messages);
      const parsedResponse = JSON.parse(response.content);
      return parsedResponse;
    } catch (error) {
      console.error('Image analysis failed, using fallback:', error);
      return this.getFallbackImageAnalysis(language);
    }
  }

  async generateHealthRecommendations(age: number, gender: string, conditions: string[] = []): Promise<string[]> {
    const systemPrompt = `Generate personalized health recommendations for a ${age}-year-old ${gender} in rural India.
    Consider common rural health challenges and provide practical, actionable advice.`;

    const userMessage = `Conditions: ${conditions.join(', ')}. Provide 5 key recommendations.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    try {
      const response = await this.makeRequest(messages);
      return response.content.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
      console.error('Health recommendations failed, using fallback:', error);
      return this.getFallbackRecommendations();
    }
  }

  private getMedicalFallbackResponse(message: string, language: string): string {
    const lowerMessage = message.toLowerCase();

    // Check if it's a medical question
    const medicalKeywords = ['pain', 'hurt', 'fever', 'temperature', 'cough', 'cold', 'sick', 'ill', 'symptom', 'health', 'medicine', 'doctor', 'hospital', 'disease', 'infection', 'headache', 'stomach', 'chest', 'breathing', 'blood', 'heart', 'diabetes', 'pressure', 'covid', 'covid-19', 'vaccine', 'vaccination'];
    const isMedicalQuestion = medicalKeywords.some(keyword => lowerMessage.includes(keyword));

    if (!isMedicalQuestion) {
      return language === 'hi'
        ? 'मैं डॉ. AI हूं, आपका मेडिकल असिस्टेंट। मैं केवल स्वास्थ्य और चिकित्सा संबंधी प्रश्नों में मदद कर सकता हूं। कृपया अपने स्वास्थ्य संबंधी चिंताओं, लक्षणों या चिकित्सा प्रश्नों के बारे में पूछें।'
        : 'I\'m Dr. AI, your medical assistant. I can only help with health and medical questions. Please ask me about your health concerns, symptoms, or medical questions.';
    }

    if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
      return language === 'hi'
        ? 'मुझे खेद है कि मैं अभी AI सेवा से जुड़ नहीं पा रहा हूं। दर्द के लिए, कृपया तुरंत डॉक्टर से सलाह लें।'
        : 'I apologize that I cannot connect to the AI service right now. For pain, please consult a doctor immediately.';
    }

    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return language === 'hi'
        ? 'बुखार के लिए, कृपया अपना तापमान मापें और डॉक्टर से सलाह लें।'
        : 'For fever, please check your temperature and consult a doctor.';
    }

    if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
      return language === 'hi'
        ? 'खांसी या सर्दी के लिए, आराम करें और गर्म पानी पिएं। यदि लक्षण बिगड़ें तो डॉक्टर से मिलें।'
        : 'For cough or cold, rest and drink warm water. If symptoms worsen, see a doctor.';
    }

    return language === 'hi'
      ? 'मुझे खेद है कि मैं अभी AI सेवा से जुड़ नहीं पा रहा हूं। कृपया डॉक्टर से सलाह लें या बाद में पुनः प्रयास करें।'
      : 'I apologize that I cannot connect to the AI service right now. Please consult a doctor or try again later.';
  }

  private getFallbackSymptomAnalysis(symptoms: string, language: string): SymptomAnalysis {
    return {
      possibleConditions: language === 'hi' ? ['सामान्य स्वास्थ्य चिंता'] : ['General Health Concern'],
      severity: 'medium',
      recommendations: language === 'hi' 
        ? ['डॉक्टर से सलाह लें', 'लक्षणों की निगरानी करें', 'आराम करें']
        : ['Consult a doctor', 'Monitor symptoms', 'Get rest'],
      shouldSeeDoctor: true,
      urgency: 'within_week'
    };
  }

  private getFallbackImageAnalysis(language: string): ImageAnalysis {
    return {
      description: language === 'hi' 
        ? 'चित्र का विश्लेषण उपलब्ध नहीं है। कृपया डॉक्टर से सलाह लें।'
        : 'Image analysis not available. Please consult a doctor.',
      possibleConditions: language === 'hi' 
        ? ['विशेषज्ञ राय आवश्यक']
        : ['Expert opinion needed'],
      confidence: 0.5,
      recommendations: language === 'hi'
        ? ['चिकित्सक से परामर्श करें']
        : ['Consult with a healthcare professional']
    };
  }

  private getFallbackRecommendations(): string[] {
    return [
      'Maintain a balanced diet with fruits and vegetables',
      'Exercise regularly for at least 30 minutes daily',
      'Get 7-8 hours of quality sleep each night',
      'Stay hydrated by drinking plenty of water',
      'Schedule regular health checkups'
    ];
  }

  // Test method to check if AI is working
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chatResponse('Hello, this is a test message.');
      return !response.includes('I apologize that I cannot connect');
    } catch (error) {
      console.error('AI connection test failed:', error);
      return false;
    }
  }
}

export const alternativeAIService = new AlternativeAIService();
