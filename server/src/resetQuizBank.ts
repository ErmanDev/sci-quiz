import db from './db';

async function resetQuizBank() {
  try {
    await db.read();
    const store = db.data as any;
    
    console.log(`📊 Current questions in vault: ${store.quizBank?.length || 0}`);
    
    // Clear the quiz bank
    store.quizBank = [];
    
    await db.write();
    console.log('✅ Quiz Bank cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing quiz bank:', error);
    process.exit(1);
  }
}

resetQuizBank();
