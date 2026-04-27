require('dotenv').config();
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

async function checkGroqModels() {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.log('❌ No GROQ_API_KEY found in environment');
      return;
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    
    console.log('🔍 Checking available Groq models...\n');

    // List of Groq models to test (ordered by preference)
    const modelsToTest = [
      'llama-3.3-70b-versatile',    // Latest Llama 3.3 70B - highly capable
      'llama-3.1-70b-versatile',    // Llama 3.1 70B - very capable
      'llama-3.2-90b-text-preview', // Llama 3.2 90B preview
      'mixtral-8x7b-32768',         // Mixtral 8x7B - good performance
      'llama-3.1-8b-instant',       // Llama 3.1 8B - fast
      'gemma-7b-it',                // Gemma 7B
      'gemma2-9b-it'                // Gemma 2 9B
    ];

    const availableModels = [];
    const unavailableModels = [];

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing ${modelName}...`);
        
        // Try a simple test generation
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: 'Hello, respond with just "OK"'
            }
          ],
          model: modelName,
          temperature: 0.5,
          max_tokens: 10,
        });
        
        const text = chatCompletion.choices[0]?.message?.content;
        
        if (text && text.trim()) {
          console.log(`✅ ${modelName} - AVAILABLE (Response: ${text.trim()})`);
          availableModels.push(modelName);
        } else {
          console.log(`⚠️ ${modelName} - No response`);
          unavailableModels.push(modelName);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ ${modelName} - ERROR: ${error.message}`);
        unavailableModels.push(modelName);
        
        // If we hit rate limits, wait longer
        if (error.status === 429) {
          console.log('⏳ Rate limit hit, waiting 10 seconds...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          // Short delay for other errors
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    console.log('\n📊 RESULTS SUMMARY:');
    console.log('==================');
    
    if (availableModels.length > 0) {
      console.log('\n✅ AVAILABLE GROQ MODELS:');
      availableModels.forEach(model => console.log(`  - ${model}`));
      
      console.log('\n🔧 RECOMMENDED MODEL FOR CODE:');
      console.log(`  Primary: ${availableModels[0]}`);
      
      // Save results to a JSON file for future reference
      const resultsPath = path.join(__dirname, 'available-models.json');
      const results = {
        lastChecked: new Date().toISOString(),
        provider: 'Groq',
        availableModels,
        recommendedModel: availableModels[0],
        totalTested: modelsToTest.length,
        status: availableModels.length > 0 ? 'success' : 'no_models_available'
      };
      
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      console.log('\n📄 Saved results to available-models.json');
      
    } else {
      console.log('\n❌ NO MODELS AVAILABLE');
      console.log('⚠️ Falling back to keyword-based analysis only');
    }
    
    if (unavailableModels.length > 0) {
      console.log('\n❌ UNAVAILABLE MODELS:');
      unavailableModels.forEach(model => console.log(`  - ${model}`));
    }

  } catch (error) {
    console.error('❌ Error checking models:', error.message);
  }
}

// Run the check
checkGroqModels().then(() => {
  console.log('\n🏁 Model check complete!');
  console.log('💡 Run "npm run check-models" to check again anytime');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
