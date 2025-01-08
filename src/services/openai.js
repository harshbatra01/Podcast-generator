import { config } from '../config';

export const generateScript = async (text) => {
  try {
    console.log('Starting script generation with OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional podcast script writer. Convert the given text into an engaging podcast script. Include clear speaker instructions and natural transitions."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Script generated successfully');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating script:', error);
    throw new Error(`Failed to generate script: ${error.message}`);
  }
}; 