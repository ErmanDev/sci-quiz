import db from './db';

async function validateQuizBank() {
  try {
    await db.read();
    const store = db.data as any;
    
    if (!Array.isArray(store.quizBank) || store.quizBank.length === 0) {
      console.log('❌ Quiz Bank is empty!');
      process.exit(1);
    }

    console.log('🔍 Validating Quiz Vault Questions...\n');
    
    let issuesFound = 0;
    let totalQuestions = store.quizBank.length;
    
    const categories: any = {
      'Earth and Space': 0,
      'Living Things and Their Environment': 0,
      'Matter': 0,
      'Force, Motion, and Energy': 0,
    };

    const types: any = {
      'multiple-choice': 0,
      'identification': 0,
    };

    // Validate each question
    for (let i = 0; i < store.quizBank.length; i++) {
      const q = store.quizBank[i];
      
      // Check required fields
      if (!q.id) {
        console.log(`❌ Question ${i + 1}: Missing ID`);
        issuesFound++;
      }
      if (!q.question) {
        console.log(`❌ Question ${i + 1}: Missing question text`);
        issuesFound++;
      }
      if (!q.answer) {
        console.log(`❌ Question ${i + 1}: Missing answer`);
        issuesFound++;
      }
      if (!q.type) {
        console.log(`❌ Question ${i + 1}: Missing type`);
        issuesFound++;
      }
      if (!q.category) {
        console.log(`❌ Question ${i + 1}: Missing category`);
        issuesFound++;
      }
      
      // Check multiple choice specific requirements
      if (q.type === 'multiple-choice') {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          console.log(`❌ Question ${i + 1}: Multiple-choice missing options or has < 2 options`);
          issuesFound++;
        }
      }
      
      // Count by category and type
      if (categories[q.category as string] !== undefined) {
        categories[q.category as string]++;
      }
      if (types[q.type as string] !== undefined) {
        types[q.type as string]++;
      }
    }

    console.log('✅ Validation Complete!\n');
    console.log(`📊 Total Questions: ${totalQuestions}`);
    console.log(`⚠️  Issues Found: ${issuesFound}\n`);
    
    console.log('📚 Questions by Category:');
    for (const [cat, count] of Object.entries(categories)) {
      console.log(`   • ${cat}: ${count} questions`);
    }
    
    console.log('\n📝 Questions by Type:');
    for (const [type, count] of Object.entries(types)) {
      console.log(`   • ${type}: ${count} questions`);
    }

    // Sample a few questions to show they have answers
    console.log('\n📋 Sample Questions with Answers:');
    const sampleIndices = [0, Math.floor(totalQuestions / 4), Math.floor(totalQuestions / 2), totalQuestions - 1];
    
    for (const idx of sampleIndices) {
      const q = store.quizBank[idx];
      console.log(`\n   Q${idx + 1} (${q.type} - ${q.category}):`);
      console.log(`   Question: ${q.question.substring(0, 60)}...`);
      console.log(`   Answer: ${q.answer}`);
      if (q.type === 'multiple-choice') {
        console.log(`   Options: ${q.options?.length} provided`);
      }
    }

    if (issuesFound === 0) {
      console.log('\n✨ All questions validated successfully!');
    } else {
      console.log(`\n⚠️  Please fix ${issuesFound} issue(s) before proceeding.`);
    }

  } catch (error) {
    console.error('❌ Error validating quiz bank:', error);
    process.exit(1);
  }
}

validateQuizBank();
