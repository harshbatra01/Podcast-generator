import { config } from '@/lib/config'

export const generateScript = async (text: string) => {
  try {
    console.log('Starting script generation with Cohere...');
    
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.cohereKey}`,
        'Cohere-Version': '2022-12-06'
      },
      body: JSON.stringify({
        model: 'command',
        prompt: `Convert the following text into an engaging podcast script with clear speaker instructions and natural transitions:\n\n${text}`,
        max_tokens: 2000,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cohere API error: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.generations[0].text;
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
}; 