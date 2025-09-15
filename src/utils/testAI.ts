import { alternativeAIService } from '@/services/alternativeAIService';

export async function testOpenRouterAPI(): Promise<boolean> {
  try {
    console.log('Testing Alternative AI Service connection...');
    
    const isWorking = await alternativeAIService.testConnection();
    
    if (isWorking) {
      console.log('✅ Alternative AI Service is working correctly!');
    } else {
      console.error('❌ Alternative AI Service test failed!');
    }
    
    return isWorking;
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

// Auto-test when this module is imported
if (typeof window !== 'undefined') {
  testOpenRouterAPI().then(success => {
    if (success) {
      console.log('✅ AI Service is working correctly!');
    } else {
      console.error('❌ AI Service test failed!');
    }
  });
}
