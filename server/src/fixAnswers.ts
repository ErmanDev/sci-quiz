import db from './db';

async function fixAnswersInQuizBank() {
  try {
    await db.read();
    const store = db.data as any;
    
    if (!Array.isArray(store.quizBank) || store.quizBank.length === 0) {
      console.log('❌ Quiz Bank is empty!');
      process.exit(1);
    }

    console.log('🔧 Fixing Answers in Quiz Vault...\n');
    
    let fixed = 0;
    let issues = 0;

    // Process each question
    for (let i = 0; i < store.quizBank.length; i++) {
      const q = store.quizBank[i];
      
      // Only process multiple-choice questions
      if (q.type === 'multiple-choice' && Array.isArray(q.options)) {
        const currentAnswer = String(q.answer).toUpperCase().trim();
        
        // Check if answer is a letter (A, B, C, D)
        if (/^[A-D]$/.test(currentAnswer)) {
          // Convert letter to index (A=0, B=1, C=2, D=3)
          const answerIndex = currentAnswer.charCodeAt(0) - 65;
          
          if (answerIndex >= 0 && answerIndex < q.options.length) {
            // Get the full option text as the answer
            const fullAnswer = q.options[answerIndex];
            
            if (q.answer !== fullAnswer) {
              q.answer = fullAnswer;
              fixed++;
            }
          } else {
            console.log(`⚠️  Q${i + 1}: Answer letter ${currentAnswer} is out of range (only ${q.options.length} options)`);
            issues++;
          }
        } else {
          // Answer is already the full option text, verify it's in the options
          if (!q.options.includes(q.answer)) {
            console.log(`⚠️  Q${i + 1}: Answer "${q.answer}" not found in options`);
            // Try to find the answer in the options
            const found = q.options.find((opt: string) => opt.includes(q.answer));
            if (found) {
              q.answer = found;
              fixed++;
            } else {
              issues++;
            }
          }
        }
      }
    }

    await db.write();
    
    console.log(`\n✅ Answers Fixed!`);
    console.log(`   • Questions fixed: ${fixed}`);
    console.log(`   • Issues found: ${issues}`);
    console.log(`\n📊 Quiz Vault Statistics:`);
    
    let mcCount = 0;
    let idCount = 0;
    
    for (const q of store.quizBank) {
      if (q.type === 'multiple-choice') mcCount++;
      if (q.type === 'identification') idCount++;
    }
    
    console.log(`   • Total Questions: ${store.quizBank.length}`);
    console.log(`   • Multiple-Choice: ${mcCount}`);
    console.log(`   • Identification: ${idCount}`);
    
    // Show some sample questions with their answers
    console.log('\n📋 Sample Questions with Full Answers:\n');
    const samples = [0, 69, 139, 279];
    
    for (const idx of samples) {
      if (idx < store.quizBank.length) {
        const q = store.quizBank[idx];
        console.log(`   Q${idx + 1} (${q.type}):`);
        console.log(`   Question: ${q.question.substring(0, 60)}...`);
        if (q.type === 'multiple-choice') {
          console.log(`   Options:`);
          q.options?.forEach((opt: string, i: number) => {
            const letter = String.fromCharCode(65 + i);
            const isCorrect = q.answer === opt ? ' ✓' : '';
            console.log(`      ${letter}. ${opt}${isCorrect}`);
          });
        }
        console.log(`   Correct Answer: ${q.answer}\n`);
      }
    }
    
    console.log('✨ All answers properly set!');

  } catch (error) {
    console.error('❌ Error fixing answers:', error);
    process.exit(1);
  }
}

fixAnswersInQuizBank();
