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

class AIService {
  private async makeRequest(messages: any[], model: string = 'microsoft/phi-3-mini-128k-instruct:free'): Promise<AIResponse> {
    try {
      console.log('Making AI request with model:', model);
      console.log('API Key (first 10 chars):', config.openRouterApiKey.substring(0, 10) + '...');
      
      const response = await fetch(`${config.openRouterBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openRouterApiKey}`,
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

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('AI Response received:', data);
      return {
        content: data.choices[0]?.message?.content || 'No response generated',
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        content: 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
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

    Be conservative in your assessment. Always recommend seeing a doctor for serious symptoms.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Patient symptoms: ${symptoms}` }
    ];

    const response = await this.makeRequest(messages);
    
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response.content);
      return parsed as SymptomAnalysis;
    } catch {
      // Fallback if JSON parsing fails
      return {
        possibleConditions: ['Unable to analyze - please consult a doctor'],
        severity: 'medium',
        recommendations: ['Please consult with a healthcare professional for proper diagnosis'],
        shouldSeeDoctor: true,
        urgency: 'within_24h',
      };
    }
  }

  async analyzeImage(imageData: string, description: string = ''): Promise<ImageAnalysis> {
    const systemPrompt = `You are a medical AI assistant specializing in visual health analysis for rural healthcare in India. 
    Analyze the provided medical image and provide insights about possible conditions.
    
    Respond with a JSON object containing:
    - description: detailed description of what you see
    - possibleConditions: array of possible medical conditions
    - confidence: number between 0 and 1
    - recommendations: array of recommendations`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Medical image analysis requested. ${description ? `Context: ${description}` : ''}` }
    ];

    const response = await this.makeRequest(messages);
    
    try {
      const parsed = JSON.parse(response.content);
      return parsed as ImageAnalysis;
    } catch {
      return {
        description: 'Unable to analyze image - please consult a doctor',
        possibleConditions: ['Requires professional medical evaluation'],
        confidence: 0.1,
        recommendations: ['Please consult with a healthcare professional for proper diagnosis'],
      };
    }
  }

  async chatResponse(message: string, context: string = '', language: string = 'en'): Promise<string> {
    const systemPrompt = `You are a helpful medical AI assistant for rural healthcare in India. 
    Provide helpful, accurate, and empathetic responses in ${language}.
    
    Guidelines:
    - Always recommend consulting a doctor for serious symptoms
    - Be culturally sensitive to rural Indian healthcare needs
    - Provide practical, actionable advice
    - Use simple, clear language
    - Never provide specific medical diagnoses
    - Focus on general health guidance and when to seek medical help`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${context ? `Context: ${context}\n\n` : ''}User: ${message}` }
    ];

    const response = await this.makeRequest(messages);
    
    // If API failed, provide a helpful fallback response
    if (response.error) {
      return this.getFallbackResponse(message, language);
    }
    
    return response.content;
  }

  private getFallbackResponse(message: string, language: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based fallback responses
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
    
    // Default fallback
    return language === 'hi'
      ? 'मुझे खेद है कि मैं अभी AI सेवा से जुड़ नहीं पा रहा हूं। कृपया डॉक्टर से सलाह लें या बाद में पुनः प्रयास करें।'
      : 'I apologize that I cannot connect to the AI service right now. Please consult a doctor or try again later.';
  }

  async generateHealthRecommendations(age: number, gender: string, conditions: string[] = []): Promise<string[]> {
    const systemPrompt = `Generate personalized health recommendations for a ${age}-year-old ${gender} in rural India.
    Consider common rural health challenges and provide practical, actionable advice.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Age: ${age}, Gender: ${gender}, Existing conditions: ${conditions.join(', ') || 'None'}` }
    ];

    const response = await this.makeRequest(messages);
    
    // Split response into array of recommendations
    return response.content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  }
}

export const aiService = new AIService();
